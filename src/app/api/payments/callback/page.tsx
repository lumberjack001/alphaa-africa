"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import BoardingPass from '@/components/BoardingPass';
import { flightService } from '@/services/flightService';
import { hotelService } from '@/services/hotelService';
import { carService } from '@/services/carService';
import { visaService } from '@/services/visaService';
import { ApiError } from '@/lib/api';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Extract reference ID and payment type from URL query parameters
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const typeParam = searchParams.get('type');
  const isFlight = typeParam === 'flight';
  const isCar = typeParam === 'car';
  const isVisa = typeParam === 'visa';

  const [navActiveTab, setNavActiveTab] = useState<string>(() => {
    if (typeParam === 'flight') return 'flights';
    if (typeParam === 'visa') return 'visa';
    if (typeParam === 'car') return 'tours';
    return 'flights';
  });

  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'confirmed' | 'pending' | 'failed' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedTicket, setConfirmedTicket] = useState<any | null>(null);
  
  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 5000);
  };

  useEffect(() => {
    if (!reference) {
      setIsLoading(false);
      setStatus('failed');
      setErrorMsg('No payment transaction reference was found in the callback URL.');
      return;
    }

    const verifyTransaction = async () => {
      try {
        setIsLoading(true);
        let verifyData: any = null;
        let bookingType: 'flight' | 'hotel' | 'car' | 'visa' = isFlight ? 'flight' : (isVisa ? 'visa' : (isCar ? 'car' : 'flight'));

        const tryFlight = async () => {
          verifyData = await flightService.verifyBooking(reference);
          bookingType = 'flight';
        };

        const tryVisa = async () => {
          verifyData = await visaService.verifyPayment(reference);
          bookingType = 'visa';
        };

        const tryCar = async () => {
          verifyData = await carService.verifyBooking(reference);
          bookingType = 'car';
        };

        const tryHotel = async () => {
          verifyData = await hotelService.verifyBooking(reference);
          bookingType = 'hotel';
        };

        // Order the verification attempts based on detected URL query parameters
        let attemptQueue: Array<() => Promise<void>> = [];
        if (isFlight) {
          attemptQueue = [tryFlight, tryHotel, tryCar, tryVisa];
        } else if (isVisa) {
          attemptQueue = [tryVisa, tryFlight, tryHotel, tryCar];
        } else if (isCar) {
          attemptQueue = [tryCar, tryFlight, tryHotel, tryVisa];
        } else {
          // Default queue when no type query is supplied (try flight first, then hotel, car, visa)
          attemptQueue = [tryFlight, tryHotel, tryCar, tryVisa];
        }

        let lastError: any = null;
        for (const attempt of attemptQueue) {
          try {
            await attempt();
            lastError = null;
            break; // Succeeded, exit loop
          } catch (err) {
            lastError = err;
            if (err instanceof ApiError && err.status === 404) {
              continue; // 404 mismatch, try next service
            }
            throw err; // Real error (e.g. 500, network loss), propagate immediately
          }
        }

        if (lastError) {
          throw lastError;
        }
        
        const rawStatus = (verifyData?.status || verifyData?.booking?.status || '').toLowerCase();
        const isSuccess = rawStatus === 'confirmed' || rawStatus === 'paid' || rawStatus === 'successful' || rawStatus === 'success';
        const isFailed = rawStatus === 'failed' || rawStatus === 'cancelled';
        
        setStatus(isSuccess ? 'confirmed' : (isFailed ? 'failed' : 'pending'));

        if (isSuccess) {
          // Construct ticket structure for BoardingPass component based on service type
          if (bookingType === 'flight') {
            setNavActiveTab('flights');
            const pnrCode = verifyData.pnr || verifyData.reference || verifyData.booking?.pnr || verifyData.booking?.reference || reference;
            const leadName = verifyData.contact_name || verifyData.customer_email || verifyData.booking?.contact_name || 'Passenger';
            
            setConfirmedTicket({
              passenger: leadName,
              cabin: verifyData.cabin || verifyData.booking?.cabin || 'Economy Class',
              hash: `#TK-${reference.substring(0, 8).toUpperCase()}`,
              pnr: pnrCode,
              details: {
                carrier: verifyData.airline || verifyData.booking?.airline || 'Amadeus Airline',
                name: verifyData.route || verifyData.booking?.route || 'Flight Reservation',
                number: verifyData.flight_number || verifyData.booking?.flight_number || 'PNR-CONFIRMED',
              },
              type: 'flight',
            });
          } else if (bookingType === 'visa') {
            setNavActiveTab('visa');
            setConfirmedTicket({
              passenger: verifyData.full_name || 'Valued Guest',
              cabin: 'Visa Consultation Assistance',
              hash: `#TX-${verifyData.reference}`,
              pnr: verifyData.reference,
              details: {
                name: verifyData.country?.name ? `Visa Assistance: ${verifyData.country.name}` : 'Visa Assistance Service',
                carrier: verifyData.country?.name ? `Visa Assistance: ${verifyData.country.name}` : 'Visa Assistance Service',
              },
              type: 'visa',
            });
          } else if (bookingType === 'car') {
            setNavActiveTab('tours');
            setConfirmedTicket({
              passenger: verifyData.guest_name || 'Valued Guest',
              cabin: verifyData.vehicle?.vehicle_type_display || 'Chauffeur Vehicle Rental',
              hash: `#TX-${verifyData.reference}`,
              pnr: verifyData.reference,
              details: {
                name: verifyData.vehicle?.name || 'Alphaa Fleet',
                carrier: verifyData.vehicle?.name || 'Alphaa Fleet',
              },
              type: 'vehicle',
            });
          } else {
            setNavActiveTab('hotels');
            setConfirmedTicket({
              passenger: verifyData.guest_name || 'Valued Guest',
              cabin: verifyData.room_type?.name || 'Hotel Lodging Reservation',
              hash: `#TX-${verifyData.reference}`,
              pnr: verifyData.reference,
              details: {
                name: verifyData.hotel?.name || 'Hotel Lodging',
                carrier: verifyData.hotel?.name || 'Hotel Lodging',
              },
              type: 'hotel',
            });
          }
          triggerToast("Transaction reference verified successfully!");
        } else if (isFailed) {
          setErrorMsg('The payment processor reported that this transaction failed.');
          triggerToast("Payment failed or was cancelled.");
        } else {
          setErrorMsg('This payment verification is still pending. Please refresh this page to try again.');
          triggerToast("Payment is still pending.");
        }
      } catch (error) { 
        setStatus('failed');
        if (error instanceof ApiError) {
          setErrorMsg(`Verification failed: ${error.message}`);
        } else {
          setErrorMsg('Network error verifying transaction status.');
        }
        triggerToast("Failed to verify transaction status.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyTransaction();
  }, [reference, isFlight, isCar, isVisa]);

  return (
    <div className="bg-[#FAF8F5] text-slate-800 antialiased min-h-screen flex flex-col justify-between selection:bg-[#FA6432] selection:text-white">
      <Navbar
        onSwitchTab={(tabId) => router.push(`/?tab=${tabId}`)}
        onReset={() => router.push('/')}
        activeTab={navActiveTab}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full">
        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-purple-100 max-w-md mx-auto">
            <div className="animate-spin h-10 w-10 border-4 border-brand-purple border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-lg font-black text-brand-purple font-heading uppercase tracking-wide">Verifying Payment</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Checking Paystack reference with system database...</p>
          </div>
        ) : status === 'confirmed' && confirmedTicket ? (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-6">
              <span className="text-xs font-black uppercase text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full tracking-wider">
                Payment Verified
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-brand-purple font-heading tracking-tight uppercase mt-3">
                Booking Confirmed!
              </h1>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Your transaction has been processed and your official travel document issued below.
              </p>
            </div>

            <BoardingPass
              confirmedTicket={confirmedTicket}
              onReset={() => router.push('/')}
              origin={confirmedTicket.details?.origin || 'LOS'}
              destination={confirmedTicket.details?.destination || 'LHR'}
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-xl border border-purple-100 max-w-lg mx-auto animate-fadeIn">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border border-rose-100">
              ✕
            </div>
            <h2 className="text-xl font-black text-brand-purple font-heading tracking-tight uppercase">
              {status === 'pending' ? 'Payment Pending' : 'Payment Failed'}
            </h2>
            <p className="text-xs text-slate-600 font-semibold mt-2 leading-relaxed">
              {errorMsg || 'We could not verify your payment reference.'}
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-6 py-3 rounded-2xl border border-purple-100 text-xs font-black text-brand-purple hover:bg-purple-50 transition-all cursor-pointer"
              >
                Go to Homepage
              </button>
              <button
                type="button"
                onClick={() => router.push('/flights')}
                className="px-6 py-3 rounded-2xl bg-brand-orange hover:bg-brand-purple text-white text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer border-none"
              >
                Browse Flights
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer onSwitchTab={(tabId) => router.push(`/?tab=${tabId}`)} triggerToast={triggerToast} />
      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 text-brand-purple border-2 border-brand-purple border-t-transparent rounded-full"></div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
