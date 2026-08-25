"use client";

import React from 'react';

interface BoardingPassProps {
  confirmedTicket: {
    passenger: string;
    cabin: string;
    hash: string;
    pnr: string;
    amadeus_order_id?: string;
    details: {
      carrier?: string;
      name?: string;
      number?: string;
      origin?: string;
      destination?: string;
      departureTime?: string;
      arrivalTime?: string;
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

  console.log("🎫 [BoardingPass Rendered PNR]:", confirmedTicket.pnr);
  console.log("🎫 [BoardingPass Ticket Object]:", confirmedTicket);

  const isPackage = confirmedTicket.type === 'package';
  const isVisa = confirmedTicket.type === 'visa';
  const displayOrigin = confirmedTicket.details?.origin || origin;
  const displayDestination = confirmedTicket.details?.destination || destination;

  return (
    <section id="boarding-pass-eticket-viewport" className="max-w-2xl mx-auto py-12 px-4 sm:px-8 text-left animate-fadeIn">

      {/* Official Styled Boarding Ticket Pass */}
      <div id="printable-boarding-ticket" className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-100 relative overflow-hidden text-left">
        {/* Decorative background visual cut */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/5 rounded-full -mr-12 -mt-12"></div>

        {/* Dash divider */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-dashed border-slate-200 pb-5 mb-5">
          <div className="flex items-center space-x-3">

            <img src="/logo.png" alt="Alphaa Africa Logo" className="h-10 w-auto object-contain" />
            <div>
              <span className="text-xs font-black tracking-tight block text-brand-purple uppercase font-sans">ALPHAA.AFRICA</span>
              <span className="text-[8px] font-bold text-brand-orange block tracking-widest uppercase">Travels E-Ticket System</span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider">
              {isVisa ? "Consultation Reference" : (isPackage ? "Enquiry Reference" : "PNR Reference Code")}
            </span>
            <strong className="text-base font-black text-slate-900 tracking-wider uppercase font-mono bg-amber-100 text-amber-950 px-2.5 py-1 rounded-lg">
              {confirmedTicket.pnr}
            </strong>
            {confirmedTicket.amadeus_order_id && (
              <span className="text-[8px] font-mono text-slate-400 block mt-1">
                Order ID: {confirmedTicket.amadeus_order_id}
              </span>
            )}
          </div>
        </div>

        {/* Main Passenger Info block */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-6 pb-5 border-b border-slate-100">
          <div>
            <span className="text-slate-400 block uppercase font-bold text-[8px] tracking-wider">
              {isVisa ? "Applicant Name" : "Passenger Name"}
            </span>
            <strong className="text-slate-900 text-sm font-black">{confirmedTicket.passenger}</strong>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-bold text-[8px] tracking-wider">
              {isVisa ? "Assistance Tier" : "Travel Class"}
            </span>
            <strong className="text-slate-900 text-sm font-bold">{confirmedTicket.cabin}</strong>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-bold text-[8px] tracking-wider">
              {isVisa ? "Appointment Status" : "Seat Number"}
            </span>
            <strong className="text-slate-900 text-sm font-bold">
              {isVisa ? "Vetted Queue" : "12A (Window)"}
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-bold text-[8px] tracking-wider">Security Reference</span>
            <strong className="text-slate-900 text-sm font-mono text-slate-500">{confirmedTicket.hash}</strong>
          </div>
        </div>

        {/* Itinerary breakdown details */}
        <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-100/40 text-xs mb-6 font-semibold">
          <span className="text-[9px] text-brand-orange uppercase font-bold block mb-1">
            {isVisa ? "Visa Consultation Disclaimers" : "Itinerary Assignment Details"}
          </span>
          <h4 className="text-sm font-black text-[#4C1D5C]">{confirmedTicket.details.carrier || confirmedTicket.details.name}</h4>
          <p className="text-slate-500 mt-1 leading-relaxed">
            {confirmedTicket.type === 'flight' && `Standard non-stop service flight reference ${confirmedTicket.details.number || 'P4-LOS90'} from ${displayOrigin} to ${displayDestination}. Please complete check-ins 45 minutes prior.`}
            {confirmedTicket.type === 'hotel' && `Confirmed hotel lodging reservation matching security token reference at ${confirmedTicket.details.name || confirmedTicket.details.carrier}. Check-in verification instructions dispatched to passenger email.`}
            {confirmedTicket.type === 'package' && `Holiday safari enquiry successfully received for ${confirmedTicket.details.name}. Your dedicated travel consultant will contact you via email/phone shortly to finalize travel logistics.`}
            {confirmedTicket.type === 'visa' && `Consultation fee of ₦5,000 successfully received. The visa team will follow up directly to review requirements. Please note: embassy visa fees are handled separately, and approval is at the embassy's sole discretion.`}
          </p>
        </div>

        {/* QR codes & verification status details */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-3">
            <div>
              <strong className="text-[15px] text-slate-700 font-mono block">
                {isVisa ? "VERIFIED_VISA_PAYMENT" : (isPackage ? "ENQUIRY_VETTED_DISPATCH" : "VERIFIED_PAYMENT_HOOK")}
              </strong>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <span className="text-[9px] text-slate-400 block">System Verification Status</span>
            <strong className="text-xs text-green-600 uppercase font-black tracking-wider block font-sans">
              {isVisa ? "✓ CONSULTATION BOOKED" : (isPackage ? "✓ ENQUIRY LOGGED & QUEUED" : "✓ APPROVED & DISPATCHED")}
            </strong>
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
          {isVisa ? "Print Consultation Receipt" : (isPackage ? "Print / Save Enquiry COPY" : "Print / Save PDF Copy")}
        </button>
      </div>

    </section>
  );
}
