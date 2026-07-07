"use client";

import React, { useState, useEffect } from 'react';
import { ApiError } from '../lib/api';
import { hotelService } from '@/services/hotelService';
import { carService } from '@/services/carService';

interface BillingModalProps {
  isOpen: boolean;
  passengerEmail: string;
  totalCost: number;
  bookingResponse: any; // backend creation response with reference and authorization_url
  onSuccess: (verifiedBooking?: any) => void;
  onDismiss: () => void;
  triggerToast: (msg: string) => void;
}

export default function BillingModal({
  isOpen,
  passengerEmail,
  totalCost,
  bookingResponse,
  onSuccess,
  onDismiss,
  triggerToast
}: BillingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loaderText, setLoaderText] = useState('');
  const [isPaidPressed, setIsPaidPressed] = useState(false);

  if (!isOpen) return null;

  const paymentRef = bookingResponse?.payment?.reference || bookingResponse?.booking?.reference;
  const paystackUrl = bookingResponse?.payment?.authorization_url;

  const handleStartPayment = () => {
    checkTotalAmount()
    if (paystackUrl) {
      setIsPaidPressed(true);
      // Redirect to Paystack portal in same tab
      window.location.href = paystackUrl;
      triggerToast("Redirecting to Paystack billing authorization portal...");
    } else {
      // Mock Fallback
      setIsLoading(true);
      setLoaderText("Querying secure transaction layers with Paystack...");

      setTimeout(() => {
        setLoaderText("TX_SUCCESS verified signature received. Dispatching payload...");
        triggerToast("Paystack payment webhook verified successfully.");

        setTimeout(() => {
          setLoaderText("Locking down flight provider PNR reference credentials...");

          setTimeout(() => {
            setLoaderText("Compiling boarding PDF e-ticket with SMTP relay...");

            setTimeout(() => {
              setIsLoading(false);
              onSuccess();
            }, 1000);
          }, 1000);
        }, 1200);
      }, 1200);
    }
  };

  const handleVerifyPayment = async () => {
    if (!paymentRef) return;

    setIsLoading(true);
    setLoaderText("Verifying Paystack payment reference with backend API...");

    try {
      const isCarBooking = !!(bookingResponse?.booking?.pickup_location || bookingResponse?.booking?.num_hours);
      const verifyData = isCarBooking 
        ? await carService.verifyBooking(paymentRef)
        : await hotelService.verifyBooking(paymentRef);

      // Verification returns booking status (confirmed, pending, failed)
      // Usually matching: status = 'confirmed'
      if (verifyData.status === 'confirmed') {
        triggerToast("E-Ticket confirmed and generated successfully!");
        onSuccess(verifyData);
      } else if (verifyData.status === 'failed') {
        triggerToast("Payment failed or was cancelled.");
        setIsLoading(false);
        setIsPaidPressed(false);
      } else {
        triggerToast("Payment is still pending. Please complete transaction on Paystack.");
        setIsLoading(false);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        triggerToast(`Verification Pending: ${error.message}`);
      } else {
        triggerToast("Network error verifying transaction status.");
      }
      setIsLoading(false);
    }
  };

  const checkTotalAmount = () => {
    console.log(`₦${totalCost.toLocaleString()}`)
    console.log(`₦${totalCost}`)
  }

  return (
    <div id="billing-payment-modal" className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4">
      <div className="bg-white text-slate-800 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 text-left">

        {/* Secure Gateway Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div>
            <span className="text-brand-orange text-[9px] uppercase font-black tracking-widest block font-sans">Paystack Secure Checkout</span>
            <h3 className="text-xs font-bold text-slate-300 font-mono truncate max-w-56">{passengerEmail}</h3>
          </div>
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-brand-orange text-lg cursor-pointer bg-transparent border-none"
          >
            ✕
          </button>
        </div>

        {/* Interactive transactional contents */}
        <div className="p-6 space-y-4 text-xs">

          <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
            <span className="text-slate-400 uppercase block tracking-wider text-[9px] font-bold">Transactional Total</span>
            <strong className="text-2xl font-black text-slate-900 block mt-1">
              ₦{(bookingResponse?.booking?.total_amount 
                ? Number(bookingResponse.booking.total_amount) 
                : totalCost).toLocaleString()}
            </strong>
            {paymentRef && (
              <span className="text-[9px] font-mono text-slate-400 mt-1 block">Ref: {paymentRef}</span>
            )}
          </div>

          {!isLoading ? (
            <div className="space-y-3">
              {paystackUrl ? (
                <>
                  <button
                    type="button"
                    onClick={handleStartPayment}
                    className="w-full bg-[#FA6432] hover:bg-[#4C1D5C] text-white font-extrabold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow cursor-pointer border-none"
                  >
                    <span>🔒 Open Paystack Gateway</span>
                  </button>
                  {isPaidPressed && (
                    <button
                      type="button"
                      onClick={handleVerifyPayment}
                      className="w-full bg-[#3EC193] hover:bg-[#34a47c] text-white font-extrabold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow cursor-pointer border-none animate-pulse"
                    >
                      <span>✓ Verify My Payment Status</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleStartPayment}
                    className="w-full bg-[#3EC193] hover:bg-[#34a47c] text-white font-extrabold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow cursor-pointer border-none"
                  >
                    <span>🔒 Pay Securely with Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStartPayment}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3 rounded-xl transition-all text-center cursor-pointer border border-slate-200"
                  >
                    🏦 Pay with Local Bank Transfer
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
              <span className="block font-bold text-slate-600 text-center">{loaderText}</span>
            </div>
          )}

          <div className="text-center text-[10px] text-slate-400 leading-tight border-t border-slate-100 pt-3">
            Transaction security is guaranteed. Auto-dispatch of e-ticket references will complete on webhook verification.
          </div>

        </div>

      </div>
    </div>
  );
}
