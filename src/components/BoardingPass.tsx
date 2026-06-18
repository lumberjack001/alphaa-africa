"use client";

import React from 'react';

interface BoardingPassProps {
  confirmedTicket: {
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
  } | null;
  onReset: () => void;
  origin: string;
  destination: string;
}

export default function BoardingPass({
  confirmedTicket,
  onReset,
  origin,
  destination
}: BoardingPassProps) {
  if (!confirmedTicket) return null;

  return (
    <section id="boarding-pass-eticket-viewport" className="max-w-2xl mx-auto py-12 px-4 sm:px-8 text-left">
      
      <div className="text-center max-w-md mx-auto mb-8">
        <span className="text-5xl block mb-3 animate-bounce">🎉</span>
        <h3 className="text-2xl font-black text-brand-purple uppercase tracking-tight font-sans">Booking Finalized!</h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          The transaction webhook was successfully verified by our Django API layer. Your official boarding PNR Reference ticket has been compiled and emailed to you.
        </p>
      </div>

      {/* Official Styled Boarding Ticket Pass */}
      <div id="printable-boarding-ticket" className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-100 relative overflow-hidden text-left">
        {/* Decorative background visual cut */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/5 rounded-full -mr-12 -mt-12"></div>
        
        {/* Dash divider */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-dashed border-slate-200 pb-5 mb-5">
          <div className="flex items-center space-x-3">
            
            {/* Logo Rebuilt reverse color */}
            <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="48" fill="#F6EFF7" />
              <path d="M52 25C37.5 25 26 36.5 26 51C26 65.5 37.5 77 52 77C58 77 64 74.5 67.5 70.5L62.5 62C57 65.5 52 65.5 52 65.5C44 65.5 38 59 38 51C38 43 44 36.5 52 36.5C59.5 39.5 63 39.5 63 39.5L67.5 35C63.5 27.5 58 25 52 25Z" fill="#4C1D5C" />
              <path d="M68.5 77C70 75 57 41 53.5 39C50.5 39 45.5 52.5 45.5 52.5L53.5 44.5L64.5 73.5H68.5Z" fill="#FA6432" />
            </svg>
            <div>
              <span className="text-xs font-black tracking-tight block text-brand-purple uppercase font-sans">ALPHAA.AFRICA</span>
              <span className="text-[8px] font-bold text-brand-orange block tracking-widest uppercase">Travels E-Ticket System</span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider">PNR Reference Code</span>
            <strong className="text-base font-black text-slate-900 tracking-wider uppercase font-mono bg-amber-100 text-amber-950 px-2.5 py-1 rounded-lg">
              {confirmedTicket.pnr}
            </strong>
          </div>
        </div>

        {/* Main Passenger Info block */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-6 pb-5 border-b border-slate-100">
          <div>
            <span className="text-slate-400 block uppercase font-bold text-[8px] tracking-wider">Passenger Name</span>
            <strong className="text-slate-900 text-sm font-black">{confirmedTicket.passenger}</strong>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-bold text-[8px] tracking-wider">Travel Class</span>
            <strong className="text-slate-900 text-sm font-bold">{confirmedTicket.cabin}</strong>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-bold text-[8px] tracking-wider">Seat Number</span>
            <strong className="text-slate-900 text-sm font-bold">12A (Window)</strong>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-bold text-[8px] tracking-wider">Security Reference</span>
            <strong className="text-slate-900 text-sm font-mono text-slate-500">{confirmedTicket.hash}</strong>
          </div>
        </div>

        {/* Itinerary breakdown details */}
        <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-100/40 text-xs mb-6 font-semibold">
          <span className="text-[9px] text-brand-orange uppercase font-bold block mb-1">Itinerary Assignment Details</span>
          <h4 className="text-sm font-black text-[#4C1D5C]">{confirmedTicket.details.carrier || confirmedTicket.details.name}</h4>
          <p className="text-slate-500 mt-1 leading-relaxed">
            {confirmedTicket.type === 'flight'
              ? `Standard non-stop service flight reference ${confirmedTicket.details.number || 'P4-LOS90'} from ${origin} to ${destination}. Please complete check-ins 45 minutes prior.`
              : `Vetted luxury accommodations or holiday arrangements successfully validated at ${confirmedTicket.details.name}.`}
          </p>
        </div>

        {/* QR codes & verification status details */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-3">
            {/* SVG barcode */}
            <svg className="w-14 h-14 bg-slate-50 p-1.5 rounded-lg text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
              <line x1="7" y1="7" x2="7" y2="7"></line>
              <line x1="17" y1="7" x2="17" y2="7"></line>
              <line x1="17" y1="17" x2="17" y2="17"></line>
              <line x1="7" y1="17" x2="7" y2="17"></line>
            </svg>
            <div>
              <span className="text-[8px] text-slate-400 block uppercase font-bold">Boarding Gate QR</span>
              <strong className="text-[10px] text-slate-700 font-mono block">VERIFIED_PAYMENT_HOOK</strong>
            </div>
          </div>
          
          <div className="text-center sm:text-right">
            <span className="text-[9px] text-slate-400 block">System Verification Status</span>
            <strong className="text-xs text-green-600 uppercase font-black tracking-wider block font-sans">✓ APPROVED & DISPATCHED</strong>
          </div>
        </div>

      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-8">
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-bold text-slate-500 hover:text-[#FA6432] underline cursor-pointer"
        >
          ← Return to Travel Hub
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="bg-brand-orange hover:bg-brand-purple text-white font-black px-6 py-4 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer border-none"
        >
          Print / Save PDF Copy
        </button>
      </div>

    </section>
  );
}
