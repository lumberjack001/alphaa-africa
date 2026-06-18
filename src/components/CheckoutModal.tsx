"use client";

import React, { useState } from 'react';

interface CheckoutModalProps {
  isOpen: boolean;
  selectedProduct: { type: string; name: string; price: number } | null;
  onDismiss: () => void;
  onProceed: (passengerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) => void;
}

export default function CheckoutModal({
  isOpen,
  selectedProduct,
  onDismiss,
  onProceed
}: CheckoutModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen || !selectedProduct) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProceed({ firstName, lastName, email, phone });
  };

  return (
    <div id="checkout-form-modal" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white text-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-purple-100 shadow-2xl overflow-y-auto max-h-[90vh] text-left">
        
        {/* Modal header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-50">
          <div>
            <span className="text-brand-orange text-[10px] uppercase font-black tracking-widest block font-sans">Checkout Portal</span>
            <h3 className="text-xl font-black text-brand-purple font-sans">Passenger Registration</h3>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="text-slate-400 hover:text-brand-orange text-xl font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Selection details container */}
        <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 mb-6">
          <span className="text-[9px] text-slate-400 font-bold block uppercase mb-1 font-sans">Your Booking Summary</span>
          <h4 className="font-extrabold text-brand-purple text-sm font-sans">{selectedProduct.name}</h4>
          <p className="text-xs text-slate-500 mt-1">Primary Segment: {selectedProduct.type.toUpperCase()}</p>
          <div className="flex items-center justify-between border-t border-purple-100 mt-3 pt-3 text-xs">
            <span className="text-slate-500 font-semibold">Total Price Due:</span>
            <strong className="text-brand-orange font-black text-base">₦{selectedProduct.price.toLocaleString()}</strong>
          </div>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 font-bold mb-1">First Name (As in Passport)</label>
              <input
                type="text"
                required
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-purple-50/30 border border-purple-100 input-focus-effect rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-bold mb-1">Last Name (As in Passport)</label>
              <input
                type="text"
                required
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-purple-50/30 border border-purple-100 input-focus-effect rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Email Address (Receives E-Ticket PDF)</label>
            <input
              type="email"
              required
              placeholder="traveler@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-purple-50/30 border border-purple-100 input-focus-effect rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Phone Number (With International Prefix)</label>
            <input
              type="tel"
              required
              placeholder="+234 812 345 6789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-purple-50/30 border border-purple-100 input-focus-effect rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-orange hover:bg-brand-purple text-white font-black py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FA6432]/10 mt-2 cursor-pointer"
          >
            Proceed to Secure Payment
          </button>

        </form>

      </div>
    </div>
  );
}
