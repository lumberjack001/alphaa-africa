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
    flight_details?: {
      airline_code?: string;
      cabin?: string;
      itineraries?: Array<{
        duration?: string;
        stops?: number;
        segments?: Array<any>;
      }>;
    };
    travelers?: Array<{
      first_name?: string;
      last_name?: string;
      type?: string;
      date_of_birth?: string;
    }>;
    type: string;
  } | null;
  onReset: () => void;
  origin: string;
  destination: string;
}

const formatDateTime = (isoString?: string) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (_) {
    return isoString;
  }
};

export default function BoardingPass({
  confirmedTicket,
  onReset,
  origin,
  destination
}: BoardingPassProps) {
  if (!confirmedTicket) return null;

  const isPackage = confirmedTicket.type === 'package';
  const isVisa = confirmedTicket.type === 'visa';
  const isFlight = confirmedTicket.type === 'flight';

  const displayOrigin = confirmedTicket.details?.origin || origin || 'LOS';
  const displayDestination = confirmedTicket.details?.destination || destination || 'DEST';

  const itinerary = confirmedTicket.flight_details?.itineraries?.[0];
  const durationStr = itinerary?.duration || '';
  const stopsCount = itinerary?.stops ?? (itinerary?.segments?.length ? itinerary.segments.length - 1 : 0);

  const formattedDepTime = formatDateTime(confirmedTicket.details?.departureTime);
  const formattedArrTime = formatDateTime(confirmedTicket.details?.arrivalTime);

  return (
    <section id="boarding-pass-eticket-viewport" className="max-w-3xl mx-auto py-10 px-4 sm:px-8 text-left animate-fadeIn">

      {/* Official Boarding Ticket Pass */}
      <div id="printable-boarding-ticket" className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-100 relative overflow-hidden text-left">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-dashed border-slate-200 pb-6 mb-6">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Alphaa Africa Logo" className="h-10 w-auto object-contain" />
            <div>
              <span className="text-xs font-black tracking-tight block text-brand-purple uppercase font-sans">ALPHAA.AFRICA</span>
              <span className="text-[9px] font-bold text-brand-orange block tracking-widest uppercase">Travels Official E-Ticket</span>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end">
            <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">
              {isVisa ? "Consultation Reference" : (isPackage ? "Enquiry Reference" : "PNR Reference Code")}
            </span>
            <strong className="text-lg font-black tracking-wider uppercase font-mono bg-amber-100 text-amber-950 px-3 py-1 rounded-xl shadow-sm">
              {confirmedTicket.pnr}
            </strong>
            {confirmedTicket.amadeus_order_id && (
              <span className="text-[9px] font-mono text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md font-bold block mt-1.5 border border-purple-100">
                Order ID: {confirmedTicket.amadeus_order_id}
              </span>
            )}
          </div>
        </div>

        {/* Flight Route & Segment Details Card */}
        {isFlight && (
          <div className="bg-gradient-to-br from-[#4C1D5C] to-[#2E1238] text-white p-6 rounded-2xl mb-6 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-purple-800/80 pb-4 mb-4">
              <div>
                <span className="text-[10px] text-purple-200 uppercase font-bold tracking-wider block">Carrier & Flight</span>
                <strong className="text-base font-black text-amber-400">
                  {confirmedTicket.details.carrier ? `${confirmedTicket.details.carrier} • ${confirmedTicket.details.number || 'Flight'}` : (confirmedTicket.details.number || 'Flight Reservation')}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-purple-200 uppercase font-bold tracking-wider block">Cabin / Class</span>
                <span className="text-xs font-black uppercase bg-white/10 px-2.5 py-1 rounded-lg">
                  {confirmedTicket.cabin}
                </span>
              </div>
            </div>

            {/* Origin -> Destination Flight Path */}
            <div className="flex items-center justify-between py-2">
              <div className="text-left">
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight block">{displayOrigin}</span>
                {formattedDepTime && (
                  <span className="text-[10px] text-purple-200 font-semibold block mt-1">
                    🛫 {formattedDepTime}
                  </span>
                )}
              </div>

              <div className="flex-1 mx-4 text-center">
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block mb-5">
                  {durationStr ? `${durationStr} • ` : ''}{stopsCount === 0 ? 'Direct Flight' : `${stopsCount} Stop${stopsCount > 1 ? 's' : ''}`}
                </span>
                <div className="relative flex items-center justify-center">
                  <div className="w-full h-0.5 bg-purple-700/60"></div>
                  <span className="absolute bg-[#3B1647] px-2 text-base">✈️</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight block">{displayDestination}</span>
                {formattedArrTime && (
                  <span className="text-[10px] text-purple-200 font-semibold block mt-1">
                    🛬 {formattedArrTime}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Passenger Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-6 pb-5 border-b border-slate-100">
          <div>
            <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">
              {isVisa ? "Applicant Name" : "Primary Passenger"}
            </span>
            <strong className="text-slate-900 text-sm font-black uppercase">{confirmedTicket.passenger}</strong>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">
              {isVisa ? "Assistance Tier" : "Travel Class"}
            </span>
            <strong className="text-slate-900 text-sm font-bold capitalize">{confirmedTicket.cabin}</strong>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">
              {isVisa ? "Appointment Status" : "Seat Status"}
            </span>
            <strong className="text-slate-900 text-sm font-bold">
              {isVisa ? "Vetted Queue" : "Standard Assigned"}
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">Security Reference</span>
            <strong className="text-slate-900 text-sm font-mono text-slate-500">{confirmedTicket.hash}</strong>
          </div>
        </div>

        {/* Multi-Travelers list if present */}
        {confirmedTicket.travelers && confirmedTicket.travelers.length > 1 && (
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span className="text-[10px] font-black text-brand-purple uppercase tracking-wider block mb-2">
              👥 Additional Travelers ({confirmedTicket.travelers.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {confirmedTicket.travelers.map((t, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-800 uppercase">{t.first_name} {t.last_name}</span>
                  <span className="text-[10px] bg-purple-50 text-purple-800 font-bold px-2 py-0.5 rounded-md uppercase">
                    {t.type || 'Passenger'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itinerary / Disclaimers Details Card */}
        <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-100/40 text-xs mb-6 font-semibold">
          <span className="text-[9px] text-brand-orange uppercase font-bold block mb-1">
            {isVisa ? "Visa Consultation Disclaimers" : "Itinerary Assignment Details"}
          </span>
          <h4 className="text-sm font-black text-[#4C1D5C]">
            {confirmedTicket.details?.carrier || confirmedTicket.details?.name || (isVisa ? 'Visa Assistance Service' : 'Travel Service')}
          </h4>
          <p className="text-slate-500 mt-1 leading-relaxed font-sans font-medium">
            {confirmedTicket.type === 'flight' && `Standard flight service reference ${confirmedTicket.details?.number || 'PNR-CONFIRMED'} from ${displayOrigin} to ${displayDestination}. Please complete airport check-in at least 45 minutes prior.`}
            {confirmedTicket.type === 'hotel' && `Confirmed hotel lodging reservation matching security token reference at ${confirmedTicket.details?.name || 'Hotel Lodging'}. Check-in verification instructions dispatched to passenger email.`}
            {confirmedTicket.type === 'package' && `Holiday safari enquiry successfully received for ${confirmedTicket.details?.name || 'Package Tour'}. Your dedicated travel consultant will contact you via email/phone shortly.`}
            {confirmedTicket.type === 'visa' && `Consultation fee of ₦5,000 successfully received. The visa team will follow up directly to review requirements. Please note: embassy visa fees are handled separately, and approval is at the embassy's sole discretion.`}
          </p>
        </div>

        {/* Verification Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-3">
            <strong className="text-xs text-slate-600 font-mono block">
              STATUS: <span className="text-green-600 font-black uppercase">CONFIRMED & ISSUED</span>
            </strong>
          </div>

          <div className="text-center sm:text-right">
            <span className="text-[9px] text-slate-400 block uppercase font-bold">System Status</span>
            <strong className="text-xs text-green-600 uppercase font-black tracking-wider block font-sans">
              ✓ VERIFIED TICKET & PNR ISSUED
            </strong>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-8">
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-bold text-slate-500 hover:text-[#FA6432] underline cursor-pointer"
        >
          ← Return to Orders
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="bg-brand-orange hover:bg-brand-purple text-white font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer border-none font-sans"
        >
          Print / Save PDF Copy
        </button>
      </div>

    </section>
  );
}
