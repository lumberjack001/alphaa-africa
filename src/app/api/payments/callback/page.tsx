"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import BoardingPass from '@/components/BoardingPass';
import { hotelService } from '@/services/hotelService';
import { carService } from '@/services/carService';
import { ApiError } from '@/lib/api';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Extract reference ID and payment type from URL query parameters
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const typeParam = searchParams.get('type');
  const isCar = typeParam === 'car';

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
        let bookingType: 'hotel' | 'car' = isCar ? 'car' : 'hotel';

        try {
          if (isCar) {
            verifyData = await carService.verifyBooking(reference);
          } else {
            verifyData = await hotelService.verifyBooking(reference);
          }
        } catch (firstError) {
          // If first attempt fails with 404, fall back to the other service
          if (firstError instanceof ApiError && firstError.status === 404) {
            try {
              if (isCar) {
                verifyData = await hotelService.verifyBooking(reference);
                bookingType = 'hotel';
              } else {
                verifyData = await carService.verifyBooking(reference);
                bookingType = 'car';
              }
            } catch (secondError) {
              throw secondError;
            }
          } else {
            throw firstError;
          }
        }
        
        setStatus(verifyData.status);
        if (verifyData.status === 'confirmed') {
          // Construct ticket structure for BoardingPass component
          if (bookingType === 'car') {
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
        } else if (verifyData.status === 'failed') {
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
  }, [reference]);

  return (
    <div className="bg-[#FAF8F5] text-slate-800 antialiased min-h-screen flex flex-col justify-between selection:bg-[#FA6432] selection:text-white">
      <Navbar
        onSwitchTab={(tabId) => router.push(`/?tab=${tabId}`)}
        onReset={() => router.push('/')}
        activeTab="hotels"
      />

      <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
        {isLoading && (
          <div className="max-w-md w-full bg-white border border-purple-100 p-8 sm:p-12 rounded-[2.5rem] shadow-xl text-center space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 border-4 border-purple-100 border-t-brand-purple rounded-full animate-spin"></div>
              <div className="w-8 h-8 border-4 border-purple-100 border-t-brand-orange rounded-full animate-spin absolute inset-0 m-auto animation-delay-150 direction-reverse"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-brand-purple uppercase tracking-tight font-sans">Verifying Transaction</h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Contacting Paystack gateway networks and updating secure GDS registry. Please do not close or reload this browser window.
              </p>
            </div>
          </div>
        )}

        {!isLoading && status === 'confirmed' && confirmedTicket && (
          <BoardingPass
            confirmedTicket={confirmedTicket}
            onReset={() => router.push('/')}
            origin={confirmedTicket.details.name}
            destination={confirmedTicket.details.name}
          />
        )}

        {!isLoading && status !== 'confirmed' && (
          <div className="max-w-md w-full bg-white border border-purple-100 p-8 sm:p-12 rounded-[2.5rem] shadow-xl text-center space-y-6">
            <span className="text-5xl block animate-pulse">
              {status === 'pending' ? '⏳' : '❌'}
            </span>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-brand-purple uppercase tracking-tight font-sans">
                {status === 'pending' ? 'Verification Pending' : 'Payment Failed'}
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                {errorMsg || 'An error occurred during payment verification process.'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full border border-slate-200 hover:border-slate-300 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-slate-500"
              >
                Go to Homepage
              </button>
              <button
                type="button"
                onClick={() => router.push('/hotels')}
                className="w-full bg-brand-orange hover:bg-brand-purple text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer border-none"
              >
                Browse Accommodations
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

export default function PaymentsCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
