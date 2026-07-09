"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import BoardingPass from '@/components/BoardingPass';
import { hotelService } from '@/services/hotelService';
import { ApiError } from '@/lib/api';

function HotelsCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');

  const [isLoading, setIsLoading] = useState(true);
  const [loaderText, setLoaderText] = useState('Initiating payment verification...');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [confirmedTicket, setConfirmedTicket] = useState<{
    passenger: string;
    cabin: string;
    hash: string;
    pnr: string;
    details: {
      carrier?: string;
      name?: string;
      number?: string;
    };
    type: string;
  } | null>(null);

  const [originCity, setOriginCity] = useState('Lagos');
  const [destinationCity, setDestinationCity] = useState('Abuja');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 5000);
  };

  useEffect(() => {
    if (!reference) {
      setErrorMessage("No transaction reference was detected. Please check the checkout page.");
      setIsLoading(false);
      return;
    }

    let retryCount = 0;
    const maxRetries = 3;

    const verifyTransaction = async () => {
      try {
        setLoaderText(`Verifying Paystack reference: ${reference}...`);
        const data = await hotelService.verifyBooking(reference);

        if (data.status === 'confirmed') {
          triggerToast("Transaction confirmed! E-Ticket generated successfully.");
          
          setConfirmedTicket({
            passenger: data.guest_name || "Guest Traveler",
            cabin: 'Hotel Lodging Reservation',
            hash: `#TX-${data.reference}`,
            pnr: data.reference,
            details: {
              name: data.room_type_name || "Premium Lodging",
              carrier: data.hotel_name || "Alphaa Partner Hotel",
            },
            type: 'hotel',
          });
          
          if (data.hotel_city) setOriginCity(data.hotel_city);
          if (data.hotel_country) setDestinationCity(data.hotel_country);
          
          setIsLoading(false);
        } else if (data.status === 'pending' && retryCount < maxRetries) {
          retryCount++;
          setLoaderText(`Payment pending. Retrying verification (${retryCount}/${maxRetries})...`);
          setTimeout(verifyTransaction, 3000);
        } else {
          setErrorMessage(
            data.status === 'failed' 
              ? "Payment failed. The transaction was cancelled or declined by your bank." 
              : "Payment remains pending. Please verify with your payment provider."
          );
          setIsLoading(false);
        }
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          setLoaderText(`Verification delayed. Retrying network link (${retryCount}/${maxRetries})...`);
          setTimeout(verifyTransaction, 3000);
        } else {
          if (error instanceof ApiError) {
            setErrorMessage(`Verification Error: ${error.message}`);
          } else {
            setErrorMessage("Connection timed out. We are waiting on a webhook update from Paystack.");
          }
          setIsLoading(false);
        }
      }
    };

    verifyTransaction();
  }, [reference]);

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center p-8 min-h-[60vh]">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h3 className="font-extrabold text-brand-purple text-base uppercase tracking-wider font-sans">Payment Verification</h3>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed animate-pulse">
            {loaderText}
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex-grow flex items-center justify-center p-8 min-h-[60vh]">
        <div className="bg-white rounded-3xl p-8 border border-purple-100 shadow-xl max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
            ⚠️
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-brand-purple uppercase tracking-tight font-sans">Checkout Verification Issue</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              {errorMessage}
            </p>
            {reference && (
              <span className="text-[10px] font-mono text-slate-400 block pt-1 bg-slate-50 py-1.5 rounded-lg border border-slate-100">
                Transaction Reference: {reference}
              </span>
            )}
          </div>
          <div className="pt-2">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-brand-orange hover:bg-brand-purple text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer border-none shadow-lg shadow-[#FA6432]/10"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (confirmedTicket) {
    return (
      <div className="py-12">
        <BoardingPass
          confirmedTicket={confirmedTicket}
          onReset={() => router.push('/')}
          origin={originCity}
          destination={destinationCity}
        />
      </div>
    );
  }

  return null;
}

export default function HotelsCallbackPage() {
  return (
    <div className="bg-[#FAF8F5] text-slate-800 antialiased min-h-screen flex flex-col justify-between selection:bg-[#FA6432] selection:text-white">
      <Navbar
        onSwitchTab={() => (window.location.href = `/#booking-engine`)}
        onReset={() => window.location.href = `/`}
        activeTab="hotels"
      />

      <main className="flex-grow navbar-offset">
        <Suspense fallback={
          <div className="flex-grow flex items-center justify-center p-8 min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        }>
          <HotelsCallbackContent />
        </Suspense>
      </main>

      <Footer onSwitchTab={() => {}} triggerToast={() => {}} />
    </div>
  );
}
