"use client";

import React from 'react';

const AIRLINE_NAMES: Record<string, string> = {
  QI: 'Ibom Air', P4: 'Air Peace', W3: 'Arik Air', ET: 'Ethiopian Airlines',
  MS: 'EgyptAir', KQ: 'Kenya Airways', SA: 'South African Airways', KP: 'ASKY Airlines',
  BA: 'British Airways', AF: 'Air France', KL: 'KLM Royal Dutch Airlines',
  LH: 'Lufthansa', EK: 'Emirates', QR: 'Qatar Airways', TK: 'Turkish Airlines',
  DL: 'Delta Air Lines', UA: 'United Airlines', AA: 'American Airlines',
};

function getAirlineName(code: string, currentName?: string): string {
  if (currentName && currentName.length > 3 && currentName !== code) return currentName;
  const upper = code?.toUpperCase() || '';
  return AIRLINE_NAMES[upper] || currentName || code || 'Airline';
}

function extractTotalPrice(offer: any): number {
  if (!offer) return 0;
  if (typeof offer.price === 'number') return offer.price;
  if (typeof offer.price === 'string') return parseFloat(offer.price) || 0;
  if (offer.price?.grandTotal) return parseFloat(offer.price.grandTotal) || 0;
  if (offer.price?.total) return parseFloat(offer.price.total) || 0;
  if (offer.raw_offer?.price?.grandTotal) return parseFloat(offer.raw_offer.price.grandTotal) || 0;
  if (offer.raw_offer?.price?.total) return parseFloat(offer.raw_offer.price.total) || 0;
  return 0;
}

function extractBaseFarePrice(offer: any, grandTotal: number): number {
  if (!offer) return grandTotal * 0.75;
  if (typeof offer.base_fare === 'number') return offer.base_fare;
  if (typeof offer.base_fare === 'string') return parseFloat(offer.base_fare) || 0;
  if (offer.price?.base) return parseFloat(offer.price.base) || 0;
  if (offer.raw_offer?.price?.base) return parseFloat(offer.raw_offer.price.base) || 0;
  return grandTotal * 0.75;
}

interface CheckoutSidebarProps {
  offer: any;
  searchContext?: {
    adults?: number;
    children?: number;
    infants?: number;
  };
  onProceedToPay: () => void;
  isLoading?: boolean;
  canProceed?: boolean;
}

export default function CheckoutSidebar({
  offer,
  searchContext,
  onProceedToPay,
  isLoading = false,
  canProceed = true,
}: CheckoutSidebarProps) {
  const adults = searchContext?.adults || 1;
  const children = searchContext?.children || 0;
  const infants = searchContext?.infants || 0;
  const totalTravellers = adults + children + infants;

  // Pricing calculations - exact ticket price without artificial charges
  const grandTotal = extractTotalPrice(offer);
  const baseFare = extractBaseFarePrice(offer, grandTotal);
  const taxesAndFees = Math.max(0, grandTotal - baseFare);

  const formatNaira = (val: number) => `₦${Math.round(val).toLocaleString()}`;

  const itineraries = offer.itineraries || offer.raw_offer?.itineraries || [];
  const firstSeg = itineraries[0]?.segments?.[0];
  const depCode = firstSeg?.departure?.iataCode || firstSeg?.departure_airport || 'LOS';
  const lastSeg = itineraries[0]?.segments?.[itineraries[0]?.segments?.length - 1];
  const arrCode = lastSeg?.arrival?.iataCode || lastSeg?.arrival_airport || 'LHR';
  const depTime = firstSeg?.departure?.at || firstSeg?.departure_time;
  const arrTime = lastSeg?.arrival?.at || lastSeg?.arrival_time;

  const carrierCode = offer.airline_code || offer.validatingAirlineCodes?.[0] || 'FL';
  const airlineName = getAirlineName(carrierCode, offer.airline);

  const formatShortTime = (str?: string) => {
    if (!str) return '';
    return new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="sticky top-28 z-20 bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-purple-950/5 border border-purple-100/80 space-y-6">
      {/* Flight Route Brief */}
      <div className="pb-4 border-b border-purple-100">
        <div>
          <span className="text-[11px] font-black text-brand-orange uppercase tracking-wider block mb-0.5">Selected Offer</span>
          <h4 className="font-black text-brand-purple text-base font-heading">
            {airlineName} • {depCode} → {arrCode}
          </h4>
          <p className="text-xs text-slate-500 font-mono mt-0.5 font-bold">
            {formatShortTime(depTime)} - {formatShortTime(arrTime)}
          </p>
        </div>
        <span className="text-xs bg-purple-50 text-brand-purple px-3 py-1 rounded-xl font-black border border-purple-100">
          {totalTravellers} {totalTravellers > 1 ? 'Travellers' : 'Traveller'}
        </span>
      </div>

      {/* Cost Breakdown Table */}
      <div className="space-y-3 text-xs text-slate-600 font-medium">
        <div className="flex justify-between items-center">
          <span>Flight Fare ({totalTravellers} {totalTravellers > 1 ? 'Passengers' : 'Passenger'})</span>
          <span className="font-bold text-slate-900">{formatNaira(baseFare)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span>Taxes & Airport Surcharges</span>
          <span className="font-bold text-slate-900">{formatNaira(taxesAndFees)}</span>
        </div>

        <div className="pt-4 border-t border-purple-100 flex justify-between items-baseline">
          <div>
            <span className="text-base font-black text-brand-purple font-heading block">Grand Total</span>
            <span className="text-[11px] text-emerald-600 font-bold">All taxes & fees included</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-brand-orange font-heading tracking-tight">
            {formatNaira(grandTotal)}
          </span>
        </div>
      </div>

      {/* Payment Action CTA */}
      <div className="pt-2">
        <button
          onClick={onProceedToPay}
          disabled={isLoading || !canProceed}
          className="w-full py-4 px-6 rounded-2xl bg-brand-orange hover:bg-brand-purple disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 hover:shadow-purple-900/20 transition-all flex items-center justify-center gap-2 group cursor-pointer border-none"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creating Order...</span>
            </div>
          ) : (
            <>
              <span>Proceed to Pay {formatNaira(grandTotal)}</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Security Reassurance */}
      <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 font-bold pt-2 border-t border-purple-100/60">
        <span className="flex items-center gap-1.5 text-emerald-600">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          256-Bit SSL Encrypted
        </span>
        <span>•</span>
        <span>Instant Ticket Issuance</span>
      </div>
    </div>
  );
}
