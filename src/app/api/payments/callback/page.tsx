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

import { lookupOrder } from '@/services/orderService';

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

        // 1. Primary endpoint: GET /api/payments/order/<reference>/
        try {
          verifyData = await lookupOrder(reference);
          if (verifyData?.booking_type) {
            const bt = String(verifyData.booking_type).toLowerCase();
            if (bt.includes('flight')) bookingType = 'flight';
            else if (bt.includes('hotel') || bt.includes('lodging')) bookingType = 'hotel';
            else if (bt.includes('car') || bt.includes('vehicle')) bookingType = 'car';
            else if (bt.includes('visa')) bookingType = 'visa';
          }
        } catch (_) {
          // 2. Fallback to service verify endpoints if order lookup fails or returns 404
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

          let attemptQueue: Array<() => Promise<void>> = [];
          if (isFlight) {
            attemptQueue = [tryFlight, tryHotel, tryCar, tryVisa];
          } else if (isVisa) {
            attemptQueue = [tryVisa, tryFlight, tryHotel, tryCar];
          } else if (isCar) {
            attemptQueue = [tryCar, tryFlight, tryHotel, tryVisa];
          } else {
            attemptQueue = [tryFlight, tryHotel, tryCar, tryVisa];
          }

          let lastError: any = null;
          for (const attempt of attemptQueue) {
            try {
              await attempt();
              lastError = null;
              break;
            } catch (err) {
              lastError = err;
              if (err instanceof ApiError && err.status === 404) {
                continue;
              }
              throw err;
            }
          }

          if (lastError) {
            throw lastError;
          }
        }

        // 3. Retry once if status is pending/paid (webhook/PNR generation in progress)
        let rawStatus = (verifyData?.status || verifyData?.payment_status || verifyData?.booking?.status || '').toLowerCase();
        if (rawStatus === 'pending' || rawStatus === 'paid') {
          await new Promise(r => setTimeout(r, 2500));
          try {
            const retryData = await lookupOrder(reference);
            if (retryData) {
              verifyData = retryData;
              rawStatus = (verifyData?.status || verifyData?.payment_status || verifyData?.booking?.status || '').toLowerCase();
            }
          } catch (_) {
            // Single retry attempt finished
          }
        }

        const isSuccess = rawStatus === 'confirmed' || rawStatus === 'paid' || rawStatus === 'successful' || rawStatus === 'success';
        const isFailed = rawStatus === 'failed' || rawStatus === 'cancelled';
        
        setStatus(isSuccess ? 'confirmed' : (isFailed ? 'failed' : 'pending'));

        if (isSuccess) {
          // Construct ticket structure for BoardingPass component
          if (bookingType === 'flight') {
            setNavActiveTab('flights');
            console.log("🎫 [Callback API Order Payload]:", verifyData);
            const pnrCode =
              verifyData.pnr ||
              verifyData.pnr_code ||
              verifyData.amadeus_pnr ||
              verifyData.booking?.pnr ||
              verifyData.booking?.pnr_code ||
              verifyData.booking?.amadeus_pnr ||
              verifyData.order?.pnr ||
              verifyData.reference ||
              reference;

            console.log("🎫 [Extracted PNR Code]:", pnrCode);
            console.log("🎫 [Extracted Amadeus Order ID]:", verifyData.amadeus_order_id || verifyData.order_id || verifyData.booking?.amadeus_order_id);

            const leadTraveler = verifyData.travelers?.[0];
            const leadName = leadTraveler 
              ? `${leadTraveler.first_name || ''} ${leadTraveler.last_name || ''}`.trim()
              : (verifyData.contact_name || verifyData.customer_email || verifyData.booking?.contact_name || 'Passenger');
            
            const flightDetails = verifyData.flight_details || verifyData.booking?.flight_details || {};
            const itinerary = flightDetails.itineraries?.[0];
            const segment = itinerary?.segments?.[0];

            setConfirmedTicket({
              passenger: leadName,
              cabin: flightDetails.cabin || verifyData.cabin || verifyData.booking?.cabin || 'Economy Class',
              hash: `#TK-${(verifyData.reference || reference).substring(0, 8).toUpperCase()}`,
              pnr: pnrCode,
              amadeus_order_id: verifyData.amadeus_order_id || verifyData.order_id || verifyData.booking?.amadeus_order_id,
              details: {
                carrier: flightDetails.airline_code || verifyData.airline || 'Amadeus Airline',
                name: segment ? `${segment.from || ''} → ${segment.to || ''}` : (verifyData.route || 'Flight Reservation'),
                number: segment?.flight_number || verifyData.flight_number || 'PNR-CONFIRMED',
                origin: segment?.from,
                destination: segment?.to,
                departureTime: segment?.depart_at,
                arrivalTime: segment?.arrive_at,
              },
              flight_details: flightDetails,
              travelers: verifyData.travelers || [],
              type: 'flight',
            });
          } else if (bookingType === 'visa') {
            setNavActiveTab('visa');
            setConfirmedTicket({
              passenger: verifyData.full_name || 'Valued Guest',
              cabin: 'Visa Consultation Assistance',
              hash: `#TX-${verifyData.reference || reference}`,
              pnr: verifyData.reference || reference,
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
              hash: `#TX-${verifyData.reference || reference}`,
              pnr: verifyData.reference || reference,
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
              hash: `#TX-${verifyData.reference || reference}`,
              pnr: verifyData.reference || reference,
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
          setErrorMsg('This payment verification is still finalizing. An email notification will be sent once completed.');
          triggerToast("Payment is still processing.");
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
