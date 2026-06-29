"use client";

import React from 'react';

export default function SecurityStatement() {
  const benefits = [
    {
      title: "Rapid E-Ticket Delivery",
      description: "Confirmed bookings are processed immediately, with official e-tickets and PNR boarding documents delivered straight to your inbox.",
      icon: "⚡"
    },
    {
      title: "Fast, Hassle-Free Bookings",
      description: "We find the best routes and fares quickly—so you spend less time searching and more time traveling.",
      icon: "✈️"
    },
    {
      title: "Real-Time Pricing",
      description: "Live access to airline and travel inventories ensures transparent pricing and up-to-date availability, with no hidden charges.",
      icon: "📊"
    },
    {
      title: "Expert-Led Advisory",
      description: "Every trip is guided by experienced travel consultants who validate routes, fares, visas, and conditions before confirmation.",
      icon: "🎓"
    },
    {
      title: "24/7 Human Support",
      description: "Enjoy responsive assistance for rebookings, cancellations, rerouting, and urgent travel needs handled by real professionals.",
      icon: "📞"
    },
    {
      title: "Africa-Rooted. Global.",
      description: "We blend deep local travel knowledge with international standards, offering guidance that works in real-world environments.",
      icon: "🌍"
    },
    {
      title: "Built for Modern Travelers",
      description: "Whether you’re traveling for work, family, or leisure, we keep things simple, reliable, and stress-free.",
      icon: "💼",
      colSpan: true
    }
  ];

  return (
    <section id="marketing-value" className="relative bg-gradient-to-b from-white via-[#FAF8F5] to-[#F6EFF7]/30 py-24 px-4 sm:px-8 overflow-hidden text-left">
      
      {/* Decorative colored glow orbs for premium aesthetics */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-brand-orange/5 to-transparent rounded-full filter blur-3xl pointer-events-none -z-10 animate-pulse duration-10000"></div>
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-brand-purple/5 to-transparent rounded-full filter blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Why Choose Us Info (5 cols) */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
            <div className="space-y-4">
              <span className="bg-brand-orange/10 text-brand-orange text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-block">
                Why Choose Us
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-brand-purple leading-[1.1] uppercase font-sans tracking-tight">
                Travel Today Is <span className="text-brand-orange">Unpredictable.</span> <br />
                Your Support <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-orange">Shouldn’t Be.</span>
              </h2>
              <div className="w-16 h-1.5 bg-gradient-to-r from-brand-orange to-brand-purple rounded-full"></div>
            </div>
            
            <p className="text-slate-600 text-sm leading-relaxed font-semibold">
              Alphaa Africa transforms standard travel bookings into seamless, end-to-end journeys. Our systems, expertise, and support structure are designed to remove friction, eliminate uncertainty, and deliver consistent results for individuals, families, and corporate travelers.
            </p>

            {/* Embedded Visual Badge with glassmorphism */}
            <div className="bg-gradient-to-br from-brand-purple via-brand-purple to-[#2E1238] text-white p-6 rounded-[2rem] border border-purple-400/20 shadow-xl shadow-brand-purple/10 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-lg">🛡️</div>
                <div>
                  <h4 className="font-extrabold text-xs text-brand-orange font-sans tracking-wide uppercase">Verified Agency Standards</h4>
                  <span className="text-[8px] text-purple-200 uppercase font-black tracking-widest block mt-0.5">IATA Certified Integrator</span>
                </div>
              </div>
              <p className="text-[11px] text-purple-100/90 leading-relaxed font-medium">
                Your ticketing credentials and transaction queries process over highly secure channels. Built on reliability. Driven by precision.
              </p>
            </div>
          </div>

          {/* Right Column: Benefits Checklist (7 cols, 2-column grid of cards) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b, idx) => (
              <div 
                key={idx} 
                className={`bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-purple-100/60 hover:border-brand-orange/40 hover:shadow-xl hover:shadow-brand-purple/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between space-y-4 ${
                  b.colSpan ? 'sm:col-span-2' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-2xl bg-purple-50 group-hover:bg-brand-orange/10 text-brand-purple group-hover:text-brand-orange transition-colors flex items-center justify-center text-sm font-bold shadow-sm">
                      {b.icon}
                    </div>
                    <span className="text-[10px] text-brand-orange/60 font-black tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                      ✓ verified
                    </span>
                  </div>
                  
                  <h4 className="text-brand-purple font-extrabold text-sm sm:text-base font-sans tracking-tight group-hover:text-brand-orange transition-colors">
                    {b.title}
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                    {b.description}
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
