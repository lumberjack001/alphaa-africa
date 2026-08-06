"use client";

import React, { useState } from 'react';
import { type FlightItinerarySegment } from '@/services/flightService';

const CITY_NAMES: Record<string, string> = {
  LOS: 'Lagos', ABV: 'Abuja', PHC: 'Port Harcourt', KAN: 'Kano', ILR: 'Ilorin', ENU: 'Enugu',
  LHR: 'London', LGW: 'London', STN: 'London', MAN: 'Manchester', EDI: 'Edinburgh', BHX: 'Birmingham',
  CDG: 'Paris', ORY: 'Paris', AMS: 'Amsterdam', FRA: 'Frankfurt', MUC: 'Munich', BER: 'Berlin',
  DXB: 'Dubai', AUH: 'Abu Dhabi', DOH: 'Doha', CAI: 'Cairo', NBO: 'Nairobi', JNB: 'Johannesburg',
  ACC: 'Accra', ADD: 'Addis Ababa', JFK: 'New York', EWR: 'New York', LAX: 'Los Angeles', ORD: 'Chicago',
  YYZ: 'Toronto', SIN: 'Singapore', BKK: 'Bangkok', HKG: 'Hong Kong', IST: 'Istanbul', MAD: 'Madrid',
};

const AIRLINE_NAMES: Record<string, string> = {
  QI: 'Ibom Air', P4: 'Air Peace', W3: 'Arik Air', ET: 'Ethiopian Airlines',
  MS: 'EgyptAir', KQ: 'Kenya Airways', SA: 'South African Airways', KP: 'ASKY Airlines',
  BA: 'British Airways', AF: 'Air France', KL: 'KLM Royal Dutch Airlines',
  LH: 'Lufthansa', EK: 'Emirates', QR: 'Qatar Airways', TK: 'Turkish Airlines',
  DL: 'Delta Air Lines', UA: 'United Airlines', AA: 'American Airlines',
};

function getCityName(iata: string): string {
  return CITY_NAMES[iata?.toUpperCase()] || iata || '';
}

function getAirlineName(code: string, currentName?: string): string {
  if (currentName && currentName.length > 3 && currentName !== code) return currentName;
  const upper = code?.toUpperCase() || '';
  return AIRLINE_NAMES[upper] || currentName || code || 'Airline';
}

function formatDuration(dur?: string): string {
  if (!dur) return 'Direct';
  if (dur.startsWith('PT')) {
    const hMatch = dur.match(/(\d+)H/i);
    const mMatch = dur.match(/(\d+)M/i);
    const h = hMatch ? parseInt(hMatch[1]) : 0;
    const m = mMatch ? parseInt(mMatch[1]) : 0;
    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m` : ''}`.trim() || 'Direct';
  }
  return dur;
}

function segDepTime(seg: FlightItinerarySegment): string {
  return seg.departure?.at || seg.departure_time || '';
}
function segArrTime(seg: FlightItinerarySegment): string {
  return seg.arrival?.at || seg.arrival_time || '';
}
function segDepCode(seg: FlightItinerarySegment): string {
  return seg.departure?.iataCode || seg.departure_airport || '---';
}
function segArrCode(seg: FlightItinerarySegment): string {
  return seg.arrival?.iataCode || seg.arrival_airport || '---';
}
function segFlightNum(seg: FlightItinerarySegment): string {
  if (seg.flight_number) return seg.flight_number;
  if (seg.carrierCode && seg.number) return `${seg.carrierCode}${seg.number}`;
  return '';
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
function formatTime(dateStr?: string): string {
  if (!dateStr) return '--:--';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function extractBaggageForLeg(itinerary: any, offer: any) {
  const raw = offer?.raw_offer || offer;
  const fareDetailsBySegment: any[] = raw?.travelerPricings?.[0]?.fareDetailsBySegment || [];
  
  const segIds = itinerary?.segments?.map((s: any) => s.id).filter(Boolean) || [];
  const legFares = segIds.length > 0
    ? fareDetailsBySegment.filter((f: any) => segIds.includes(f.segmentId))
    : fareDetailsBySegment;

  const firstFd = legFares[0] || fareDetailsBySegment[0] || {};
  const cabinBag = firstFd.includedCabinBags;
  const checkedBag = firstFd.includedCheckedBags;

  let cabinLabel = '1 × Cabin Baggage included';
  if (cabinBag) {
    const qty = cabinBag.quantity;
    const weight = cabinBag.weight ? `${cabinBag.weight}${cabinBag.weightUnit || 'kg'}` : null;
    if (qty !== undefined || weight) {
      cabinLabel = `${qty ?? 1} × ${weight || '7kg'} Cabin Baggage included`;
    }
  }

  let checkedLabel = 'Standard Checked Baggage included';
  if (checkedBag) {
    const qty = checkedBag.quantity;
    const weight = checkedBag.weight ? `${checkedBag.weight}${checkedBag.weightUnit || 'kg'}` : null;
    if (qty === 0) {
      checkedLabel = 'No Checked Baggage included';
    } else if (qty !== undefined || weight) {
      checkedLabel = `${qty ?? 1} × ${weight || '23kg'} Checked Baggage included`;
    }
  }

  return { cabinLabel, checkedLabel };
}

interface FlightCheckoutSummaryProps {
  offer: any;
  searchContext?: {
    cabin?: string;
    adults?: number;
    children?: number;
    infants?: number;
  };
}

export default function FlightCheckoutSummary({ offer, searchContext }: FlightCheckoutSummaryProps) {
  const [showFareRules, setShowFareRules] = useState(false);

  const itineraries = offer.itineraries || offer.raw_offer?.itineraries || [];
  const carrierCode = offer.airline_code || offer.validatingAirlineCodes?.[0] || 'FL';
  const airlineName = getAirlineName(carrierCode, offer.airline);
  const logoUrl = `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${carrierCode}.png`;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-purple-950/5 border border-purple-100/80 mb-8">
      {/* Header with Step Indicator */}
      <div className="flex items-center gap-3.5 pb-6 mb-6 border-b border-purple-100/70">
        <div className="w-9 h-9 rounded-2xl bg-brand-purple text-white font-black flex items-center justify-center text-base shadow-md shadow-purple-900/20">
          1
        </div>
        <div>
          <h2 className="text-xl font-black text-brand-purple font-heading tracking-tight uppercase">Flight Booking Summary</h2>
          <p className="text-xs text-slate-500 font-semibold">Review your selected flight itinerary and baggage allowance</p>
        </div>
      </div>

      {/* Flight Cards for each leg */}
      <div className="space-y-6">
        {itineraries.map((itinerary: any, legIdx: number) => {
          const isReturn = legIdx === 1;
          const segments = itinerary.segments || [];
          const firstSeg = segments[0] || {};
          const lastSeg = segments[segments.length - 1] || firstSeg;

          const depTime = segDepTime(firstSeg);
          const arrTime = segArrTime(lastSeg);
          const depCode = segDepCode(firstSeg);
          const arrCode = segArrCode(lastSeg);
          const stops = itinerary.stops ?? Math.max(0, segments.length - 1);
          const durationStr = formatDuration(itinerary.duration);
          const baggage = extractBaggageForLeg(itinerary, offer);

          return (
            <div key={legIdx} className="bg-gradient-to-br from-purple-50/40 via-white to-purple-50/20 rounded-2xl p-5 sm:p-6 border border-purple-100/90 shadow-xs">
              {/* Leg Title & Badge */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${isReturn ? 'bg-brand-orange text-white' : 'bg-brand-purple text-white'}`}>
                    {isReturn ? 'RETURN LEG' : 'OUTBOUND LEG'}
                  </span>
                  <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-purple-100">
                    {formatDate(depTime)}
                  </span>
                </div>
                <span className="text-xs font-black text-brand-purple bg-purple-100/60 px-3.5 py-1 rounded-xl border border-purple-200/60 uppercase">
                  {offer.cabin || searchContext?.cabin || 'Economy'}
                </span>
              </div>

              {/* Airline details */}
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-12 h-12 bg-white rounded-2xl p-2 border border-purple-100 shadow-xs flex items-center justify-center shrink-0">
                  <img
                    src={logoUrl}
                    alt={airlineName}
                    className="h-7 object-contain max-w-full"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      ((e.target as HTMLElement).nextElementSibling as HTMLElement).style.display = 'block';
                    }}
                  />
                  <span className="hidden text-xl">✈️</span>
                </div>
                <div>
                  <h4 className="font-black text-brand-orange text-base leading-tight font-heading">
                    {airlineName}
                  </h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    Flight {segFlightNum(firstSeg) || `${carrierCode}-101`} {segments.length > 1 ? `· ${segments.length - 1} stopover` : '· Direct'}
                  </p>
                </div>
              </div>

              {/* Flight Route Visual Bar */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 bg-white p-5 rounded-2xl border border-purple-100 shadow-xs mb-4">
                {/* Departure */}
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-brand-purple font-heading">{formatTime(depTime)}</div>
                  <div className="text-sm font-black text-slate-800 tracking-tight">{depCode}</div>
                  <div className="text-xs font-bold text-slate-500 truncate">{getCityName(depCode)}</div>
                </div>

                {/* Duration & Stops Visual */}
                <div className="flex flex-col items-center px-4 py-2 min-w-[150px]">
                  <span className="text-xs font-black text-brand-purple mb-1.5 uppercase tracking-wider">{durationStr}</span>
                  <div className="w-full flex items-center gap-1.5">
                    <div className="h-[2px] bg-purple-200 flex-1"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-orange shadow-xs"></div>
                    <div className="h-[2px] bg-purple-200 flex-1"></div>
                  </div>
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide mt-1.5">
                    {stops === 0 ? 'Direct Flight' : `${stops} stop${stops > 1 ? 's' : ''}`}
                  </span>
                </div>

                {/* Arrival */}
                <div className="md:text-right">
                  <div className="text-2xl sm:text-3xl font-black text-brand-purple font-heading">{formatTime(arrTime)}</div>
                  <div className="text-sm font-black text-slate-800 tracking-tight">{arrCode}</div>
                  <div className="text-xs font-bold text-slate-500 truncate">{getCityName(arrCode)}</div>
                </div>
              </div>

              {/* Dynamic Baggage Inclusion Details */}
              <div className="flex flex-wrap items-center gap-3 text-xs pt-3 border-t border-purple-100/60">
                <span className="font-bold text-brand-purple bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <span>🎒</span> {baggage.cabinLabel}
                </span>
                <span className="font-bold text-brand-purple bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <span>🧳</span> {baggage.checkedLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fare Rules Accordion */}
      <div className="mt-6 pt-5 border-t border-purple-100">
        <button
          onClick={() => setShowFareRules(!showFareRules)}
          type="button"
          className="flex items-center justify-between w-full p-4 rounded-2xl bg-purple-50/50 hover:bg-purple-100/40 transition-colors text-left border border-purple-100 group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-brand-purple group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span className="font-black text-brand-purple font-heading text-sm uppercase tracking-wide">Fare Rules & Refund Policy</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-3 py-0.5 rounded-full ml-2">
              Refundable Ticket
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-brand-purple transition-transform duration-200 ${showFareRules ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        {showFareRules && (
          <div className="mt-3 p-5 bg-purple-50/30 rounded-2xl text-xs text-slate-700 space-y-2 border border-purple-100 animate-fadeIn font-medium">
            <p className="font-bold text-brand-purple text-sm">{airlineName} Standard Conditions:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Cancellation:</strong> Cancellations made 24+ hours prior to departure are subject to standard airline admin fees.</li>
              <li><strong>Date Changes:</strong> Ticket modifications permitted with applicable reissue fee + fare difference.</li>
              <li><strong>No Show:</strong> No-show tickets forfeit monetary value and cannot be refunded.</li>
              <li><strong>Visa Travel Policy:</strong> Passengers must hold valid visa documents for international destinations.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
