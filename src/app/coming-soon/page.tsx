"use client";

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ComingSoonPage() {
  return (
    <div className="bg-[#FAF8F5] text-slate-800 antialiased min-h-screen flex flex-col justify-between selection:bg-[#FA6432] selection:text-white font-sans">
      <Navbar
        onSwitchTab={() => (window.location.href = '/#booking-engine')}
        onReset={() => (window.location.href = '/')}
        activeTab=""
      />

      <main className="flex-grow navbar-offset flex items-center justify-center py-16 px-4">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-12 border border-purple-100 shadow-2xl text-center space-y-6 relative overflow-hidden">
          {/* Glow decors */}
          <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-brand-orange/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-brand-purple/10 blur-2xl pointer-events-none" />

          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center mx-auto text-4xl text-brand-purple border border-purple-100/50 animate-pulse">
            ⏳
          </div>

          <div className="space-y-3">
            <span className="bg-brand-orange/10 text-brand-orange font-black px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest inline-block">
              Coming Soon
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-brand-purple uppercase tracking-tight leading-none">
              Booking Engine <br />
              <span className="text-brand-orange font-normal italic font-sans lowercase">integration in progress</span>
            </h1>
            <p className="text-sm text-slate-500 font-semibold leading-relaxed max-w-md mx-auto">
              We are currently establishing secure real-time connections with Sabre, Amadeus, and top global hotel reservation databases to bring you the best deals.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              href="/"
              className="w-full sm:w-auto bg-brand-purple hover:bg-brand-orange text-white font-extrabold px-8 py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md block text-center border-none"
            >
              Return to Home
            </Link>
            <a
              href="https://api.whatsapp.com/send?phone=2347066851051&text=Hello%20Alphaa.Africa%2C%0AI%27d%20like%20to%20book%20a%20trip%20manually!"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-purple-50 hover:bg-purple-100 text-brand-purple font-extrabold px-8 py-4 rounded-xl text-xs uppercase tracking-wider transition-all block text-center border border-purple-100/50"
            >
              Book Manually via Chat
            </a>
          </div>
        </div>
      </main>

      <Footer onSwitchTab={() => {}} triggerToast={() => {}} />
    </div>
  );
}
