"use client";

import React from 'react';
import { useScrollEntrance } from '@/hooks/useScrollEntrance';

export default function SecurityStatement() {
  const [band1Ref, band1Visible] = useScrollEntrance();
  const [band2Ref, band2Visible] = useScrollEntrance();
  const [band3Ref, band3Visible] = useScrollEntrance();

  return (
    <div id="marketing-value" className="w-full overflow-hidden">
      
      {/* Band 1: Trust & Security (Dark Mode) */}
      <section 
        ref={band1Ref}
        className="bg-gradient-to-br from-[#2E1238] via-[#1D0C22] to-[#120518] text-white py-24 px-4 sm:px-8 relative border-b border-purple-950"
      >
        {/* Glow orb */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-brand-orange/5 rounded-full filter blur-3xl pointer-events-none -z-10 animate-pulse duration-10000"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
          
          {/* Header & Typography (7 cols) */}
          <div 
            className={`lg:col-span-7 space-y-6 transition-all duration-1000 ease-out transform ${
              band1Visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'
            }`}
          >
            <span className="text-brand-orange text-xs font-black uppercase tracking-widest block animate-pulse">
              01 / Global Trust & Standards
            </span>
            <h2 className="text-3xl sm:text-5xl font-black leading-[1.1] uppercase font-sans tracking-tight">
              Secured on <span className="text-brand-orange">Official</span> <br />
              Airline API Channels.
            </h2>
            <div className="w-20 h-1.5 bg-brand-orange rounded-full transition-all duration-1000 delay-500 scale-x-100 origin-left"></div>
            <p className="text-purple-200/80 text-sm leading-relaxed font-semibold max-w-xl">
              We safeguard your transactions through direct system handshakes. By routing ticketing credentials over encrypted, official GDS and NDC connections, we eliminate mid-tier handlers and ensure complete checkout security.
            </p>
          </div>
          
          {/* Visual Trust Badge (5 cols) */}
          <div 
            className={`lg:col-span-5 transition-all duration-1000 ease-out delay-200 transform ${
              band1Visible ? 'opacity-100 translate-y-0 rotate-0' : 'opacity-0 translate-y-16 rotate-2'
            }`}
          >
            <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-6 hover:border-brand-orange/30 hover:shadow-brand-orange/5 hover:scale-[1.01] transition-all duration-500 group">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-brand-orange text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-brand-orange/20 group-hover:rotate-6 transition-transform duration-300">
                  🛡️
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-brand-orange font-sans tracking-wide uppercase">IATA Certified Integrator</h4>
                  <span className="text-[9px] text-purple-300 uppercase font-black tracking-widest block mt-0.5">TLS 1.3 Encrypted Channel</span>
                </div>
              </div>
              
              <ul className="space-y-4 text-xs font-semibold text-purple-100/90">
                {[
                  { bold: "Direct Handshakes:", detail: "Instant booking credentials verification." },
                  { bold: "Data Protection:", detail: "Full passenger info encryption standard." },
                  { bold: "Official PNR:", detail: "Direct airline-validated record creation." }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 group/item">
                    <span className="text-brand-orange text-sm leading-none transition-transform group-hover/item:scale-125">✓</span>
                    <span><strong>{item.bold}</strong> {item.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* Band 2: Support & Dedication (Light Mode) */}
      <section 
        ref={band2Ref}
        className="bg-white text-slate-800 py-24 px-4 sm:px-8 border-b border-purple-50"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
          
          {/* Visual Support Avatar Showcase (5 cols) */}
          <div 
            className={`lg:col-span-5 lg:order-1 order-2 transition-all duration-1000 ease-out transform ${
              band2Visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'
            }`}
          >
            <div className="bg-gradient-to-br from-[#FAF8F5] to-[#F6EFF7]/40 p-8 rounded-[2.5rem] border border-purple-100/50 shadow-sm space-y-6 hover:shadow-2xl hover:border-brand-purple/20 transition-all duration-500 group">
              <div className="flex items-center justify-between">
                <div className="flex -space-x-3.5">
                  {[
                    { name: 'Sarah', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80', translate: 'group-hover:-translate-x-1' },
                    { name: 'Daniel', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80', translate: '' },
                    { name: 'Amara', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80', translate: 'group-hover:translate-x-1' },
                  ].map((av, i) => (
                    <img
                      key={i}
                      src={av.img}
                      alt={av.name}
                      className={`w-12 h-12 rounded-full border-4 border-white object-cover shadow-sm transition-transform duration-300 ${av.translate}`}
                    />
                  ))}
                </div>
                <span className="bg-brand-purple/10 text-brand-purple text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> ALWAYS ONLINE
                </span>
              </div>

              <ul className="space-y-4 text-xs font-semibold text-slate-600">
                {[
                  { bold: "Zero Bot Queues:", detail: "Connect directly to certified travel specialists." },
                  { bold: "Instant Rerouting:", detail: "Quick rebookings during flight cancellations." },
                  { bold: "Global Care:", detail: "24/7 urgent handling of travel logistics." }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 group/item">
                    <span className="text-brand-purple text-sm leading-none transition-transform group-hover/item:scale-125">✓</span>
                    <span><strong>{item.bold}</strong> {item.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Header & Typography (7 cols) */}
          <div 
            className={`lg:col-span-7 lg:order-2 order-1 space-y-6 transition-all duration-1000 ease-out delay-200 transform ${
              band2Visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'
            }`}
          >
            <span className="text-brand-purple text-xs font-black uppercase tracking-widest block">
              02 / 24-7 Human Dedication
            </span>
            <h2 className="text-3xl sm:text-5xl font-black leading-[1.1] uppercase font-sans tracking-tight text-brand-purple">
              We Solve Travel <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-orange">Complications</span> <br />
              In Minutes.
            </h2>
            <div className="w-20 h-1.5 bg-brand-purple rounded-full"></div>
            <p className="text-slate-500 text-sm leading-relaxed font-semibold max-w-xl">
              Travel today is unpredictable, but your support structure shouldn't be. Bypassing automated chatbots, our dedicated team of live consultants works around the clock to handle cancellations, visa verification, and immediate re-routing.
            </p>
          </div>

        </div>
      </section>

      {/* Band 3: Inventory & Pricing (Soft Lilac Mode) */}
      <section 
        ref={band3Ref}
        className="bg-gradient-to-b from-white via-[#FAF8F5] to-[#F6EFF7]/30 py-24 px-4 sm:px-8"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
          
          {/* Header & Typography (7 cols) */}
          <div 
            className={`lg:col-span-7 space-y-6 transition-all duration-1000 ease-out transform ${
              band3Visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'
            }`}
          >
            <span className="text-brand-purple text-xs font-black uppercase tracking-widest block">
              03 / Real-Time Sync & Booking
            </span>
            <h2 className="text-3xl sm:text-5xl font-black leading-[1.1] uppercase font-sans tracking-tight text-brand-purple">
              Real-Time Pricing. <br />
              <span className="text-brand-orange">Instant</span> PNR Delivery.
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-brand-purple to-brand-orange rounded-full"></div>
            <p className="text-slate-500 text-sm leading-relaxed font-semibold max-w-xl">
              Compare flight schedules and lodging availability directly connected to live carrier databases. With transparent pricing, automatic currency conversion, and instant boarding pass dispatch, what you book is guaranteed.
            </p>
          </div>
          
          {/* Visual Booking Confirmation Pass (5 cols) */}
          <div 
            className={`lg:col-span-5 transition-all duration-1000 ease-out delay-200 transform ${
              band3Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            }`}
          >
            <div className="bg-white border border-purple-100 p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:border-brand-orange/30 hover:scale-[1.005] transition-all duration-500 space-y-6 group">
              <div className="flex items-center justify-between border-b border-purple-50 pb-4">
                <div className="space-y-1">
                  <span className="text-[8px] text-slate-400 font-bold uppercase block leading-none">Best Price Found</span>
                  <strong className="text-lg font-black text-brand-purple">₦850,000</strong>
                </div>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black px-3 py-1 rounded-xl uppercase tracking-wider transition-colors group-hover:bg-emerald-100">
                  ✓ 100% Verified
                </span>
              </div>
              
              <ul className="space-y-4 text-xs font-semibold text-slate-600">
                {[
                  { bold: "Zero Hidden Fees:", detail: "Live pricing synced with GDS." },
                  { bold: "Rapid E-Ticket:", detail: "PNR reference delivered instantly." },
                  { bold: "Optimal Routing:", detail: "Auto-combines layovers and best fares." }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 group/item">
                    <span className="text-brand-orange text-sm leading-none transition-transform group-hover/item:scale-125">✓</span>
                    <span><strong>{item.bold}</strong> {item.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
