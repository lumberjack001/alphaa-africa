"use client";

import React from 'react';

export default function SecurityStatement() {
  return (
    <section id="marketing-value" className="bg-gradient-to-b from-white to-[#FDFBFD] py-20 px-4 sm:px-8 text-left">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Copy parameters */}
          <div className="space-y-6">
            <span className="text-brand-orange text-xs font-black uppercase tracking-widest block">Structural Integrity</span>
            <h2 className="text-2xl sm:text-4xl font-black text-brand-purple leading-tight uppercase font-sans">We prioritize reliability & lightning dispatch</h2>
            <p className="text-slate-600 text-sm leading-relaxed font-semibold">
              Alphaa.Africa transforms standard consumer reservations into frictionless, unified pathways. See why thousands of families and business operators trust our platform daily.
            </p>
            
            <div className="space-y-4 pt-4 text-xs">
              <div className="flex items-start space-x-3">
                <span className="bg-purple-100 text-brand-purple p-2.5 rounded-xl text-sm font-bold flex items-center justify-center w-6 h-6 shrink-0">✓</span>
                <div>
                  <strong className="text-brand-purple text-sm font-black block font-sans">60-Second Automated E-Ticket Delivery</strong>
                  <span className="text-slate-500 font-semibold">Upon transaction confirmation, our PDF compiling pipeline delivers official PNR boarding reference documents directly to your email inbox.</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-purple-100 text-brand-purple p-2.5 rounded-xl text-sm font-bold flex items-center justify-center w-6 h-6 shrink-0">✓</span>
                <div>
                  <strong className="text-brand-purple text-sm font-black block font-sans">Stateless Real-Time Price Engine</strong>
                  <span className="text-slate-500 font-semibold">Direct live integrations with hotel aggregators and GDS services eliminate hidden ticketing fee surges during passenger checkouts.</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-purple-100 text-brand-purple p-2.5 rounded-xl text-sm font-bold flex items-center justify-center w-6 h-6 shrink-0">✓</span>
                <div>
                  <strong className="text-brand-purple text-sm font-black block font-sans">24/7 Premium Operational Officers</strong>
                  <span className="text-slate-500 font-semibold">Gain immediate travel assistance, flight re-routings, hotel modifications, or booking cancellations through dedicated communication lines.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Interactive Security Panel Graphic */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[#4C1D5C]/5 rounded-3xl transform rotate-2 -z-10"></div>
            <div className="bg-gradient-to-br from-[#4C1D5C] to-[#2E1238] text-white p-8 sm:p-12 rounded-3xl border border-purple-400/20 shadow-xl space-y-6 text-left w-full">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-lg">🔒</div>
                <div>
                  <h4 className="font-extrabold text-sm text-brand-orange font-sans">Secure Webhook Architecture</h4>
                  <span className="text-[9px] text-purple-200">Payment Security & Verification Standards</span>
                </div>
              </div>
              <p className="text-xs text-purple-100 leading-relaxed font-semibold">
                Your ticketing credentials and transaction queries process over highly secure channels. By routing merchant data through verified webhooks, we ensure safe and efficient payment processing.
              </p>
              <div className="border-t border-purple-400/20 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[8px] uppercase font-bold text-purple-300">Certified Integrator</span>
                  <strong className="text-white text-xs block tracking-widest font-mono">PAYSTACK & FLUTTERWAVE</strong>
                </div>
                <span className="text-3xl">💳</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
