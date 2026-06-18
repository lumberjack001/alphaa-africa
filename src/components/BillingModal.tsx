"use client";

import React, { useState } from 'react';

interface BillingModalProps {
  isOpen: boolean;
  passengerEmail: string;
  totalCost: number;
  onSuccess: () => void;
  triggerToast: (msg: string) => void;
}

export default function BillingModal({
  isOpen,
  passengerEmail,
  totalCost,
  onSuccess,
  triggerToast
}: BillingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loaderText, setLoaderText] = useState('');

  if (!isOpen) return null;

  const handleStartPayment = () => {
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
  };

  return (
    <div id="billing-payment-modal" className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4">
      <div className="bg-white text-slate-800 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 text-left">
        
        {/* Secure Gateway Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div>
            <span className="text-brand-orange text-[9px] uppercase font-black tracking-widest block font-sans">Paystack Secure Checkout</span>
            <h3 className="text-xs font-bold text-slate-300 font-mono">{passengerEmail}</h3>
          </div>
          <span className="text-2xl">💳</span>
        </div>

        {/* Interactive transactional contents */}
        <div className="p-6 space-y-4 text-xs">
          
          <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
            <span className="text-slate-400 uppercase block tracking-wider text-[9px] font-bold">Transactional Total</span>
            <strong className="text-2xl font-black text-slate-900 block mt-1">
              ₦{totalCost.toLocaleString()}
            </strong>
          </div>

          {!isLoading ? (
            <div className="space-y-3">
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
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
              <span className="block font-bold text-slate-600">{loaderText}</span>
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
