"use client";

import React from 'react';

export default function WhyChooseUs() {
  const leftFeatures = [
    {
      title: "Rapid E-Ticket Delivery",
      description: "Confirmed bookings are processed immediately, with official e-tickets and PNR boarding documents delivered straight to your inbox.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      )
    },
    {
      title: "Fast, Hassle-Free Bookings",
      description: "We find the best routes and fares quickly—so you spend less time searching and more time traveling.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      )
    },
    {
      title: "Real-Time Pricing",
      description: "Live access to airline and travel inventories ensures transparent pricing, eliminating last-minute fare changes or hidden charges.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      )
    },
    {
      title: "Expert Travel Advisory",
      description: "Every trip is guided by experienced travel consultants who validate routes, fares, visa requirements, and travel conditions.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    }
  ];

  const bottomFeatures = [
    {
      title: "24/7 Human Support",
      description: "Enjoy responsive assistance for rebookings, cancellations, rerouting, and urgent travel needs—handled by real professionals, not automated responses.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      )
    },
    {
      title: "Africa-Rooted. Globally Connected",
      description: "We blend deep local travel knowledge with international standards, offering guidance that works in real-world African and global environments.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5V14a1 1 0 0 0-1-1h-.75a.25.25 0 0 1-.25-.25v-.5a.5.5 0 0 1 .5-.5h1.75a1 1 0 0 0 1-1V9.25a.25.25 0 0 1 .25-.25h.5a.5.5 0 0 1 .5.5v1.25a1 1 0 0 0 1 1h.75a.25.25 0 0 1 .25.25v2a1 1 0 0 0 1 1h.75a.25.25 0 0 1 .25.25V16a10 10 0 0 1-9 3z" />
        </svg>
      )
    },
    {
      title: "Built for Busy, Modern Travelers",
      description: "Whether you’re traveling for work, family, or leisure, we keep things simple, reliable, and stress-free.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="6" width="18" height="14" rx="2" />
          <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      )
    }
  ];

  const handlePlanTrip = () => {
    const el = document.getElementById('booking-engine');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 px-4 sm:px-8 bg-gradient-to-b from-transparent to-[#FAF8F5] text-left">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Main Grid: Left copy/grid + Right image card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Heading and 4 Grid points */}
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#4C1D5C] tracking-tight font-heading">
                Why Choose <span className="text-brand-orange italic font-normal font-sans">Alphaa.Africa?</span>
              </h2>
              <div className="h-0.5 w-16 bg-brand-orange rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {leftFeatures.map((feat, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <span className="w-11 h-11 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 shadow-inner">
                    {feat.icon}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-800 tracking-tight font-sans">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Adventure card with image background */}
          <div className="relative h-[340px] rounded-[2rem] overflow-hidden shadow-2xl bg-slate-900 flex flex-col justify-between p-8 group">
            <img 
              src="/zanzibar_beach.png" 
              alt="Zanzibar Beach" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 space-y-3 max-w-sm mt-auto">
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest block font-sans">
                Let's Go!
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-heading leading-tight">
                Your Next Adventure Awaits!
              </h3>
              <p className="text-xs text-slate-200 font-semibold leading-relaxed">
                Discover breathtaking places and create unforgettable memories.
              </p>
              <button
                onClick={handlePlanTrip}
                className="bg-white hover:bg-slate-100 text-[#4C1D5C] font-black text-[11px] uppercase tracking-wider px-5 py-3 rounded-full flex items-center space-x-2 w-fit mt-5 cursor-pointer shadow-md transition-all duration-300"
              >
                <span>Plan Your Trip</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Row: Spacer and 3 points */}
        <div className="border-t border-purple-100/50 pt-12 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {bottomFeatures.map((feat, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <span className="w-11 h-11 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 shadow-inner">
                  {feat.icon}
                </span>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-800 tracking-tight font-sans">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
