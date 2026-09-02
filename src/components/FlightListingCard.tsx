"use client";

import React, { useState } from 'react';
import { type FlightOfferResult, type FlightItinerarySegment } from '@/services/flightService';

// ─── Airport city name lookup ─────────────────────────────────────────────────
const CITY_NAMES: Record<string, string> = {
  LOS: 'Lagos', ABV: 'Abuja', PHC: 'Port Harcourt', KAN: 'Kano', ILR: 'Ilorin', ENU: 'Enugu',
  LHR: 'London', LGW: 'London', STN: 'London', MAN: 'Manchester', EDI: 'Edinburgh', BHX: 'Birmingham',
  CDG: 'Paris', ORY: 'Paris', AMS: 'Amsterdam',
  FRA: 'Frankfurt', MUC: 'Munich', DUS: 'Düsseldorf', BER: 'Berlin',
  DXB: 'Dubai', AUH: 'Abu Dhabi', SHJ: 'Sharjah',
  DOH: 'Doha', KWI: 'Kuwait City', BAH: 'Bahrain',
  CAI: 'Cairo', CMN: 'Casablanca', TUN: 'Tunis', RAK: 'Marrakech', ALG: 'Algiers',
  NBO: 'Nairobi', MBA: 'Mombasa', JRO: 'Kilimanjaro', DAR: 'Dar es Salaam', ZNZ: 'Zanzibar',
  JNB: 'Johannesburg', CPT: 'Cape Town', DUR: 'Durban',
  ACC: 'Accra', DKR: 'Dakar', ABJ: 'Abidjan', LFW: 'Lomé', BKO: 'Bamako',
  ADD: 'Addis Ababa', EBB: 'Entebbe', KGL: 'Kigali',
  JFK: 'New York', EWR: 'New York', LGA: 'New York',
  LAX: 'Los Angeles', ORD: 'Chicago', ATL: 'Atlanta', IAD: 'Washington', DFW: 'Dallas',
  YYZ: 'Toronto', YVR: 'Vancouver',
  SIN: 'Singapore', KUL: 'Kuala Lumpur', BKK: 'Bangkok',
  HKG: 'Hong Kong', ICN: 'Seoul', NRT: 'Tokyo', HND: 'Tokyo',
  PEK: 'Beijing', PVG: 'Shanghai', DEL: 'New Delhi', BOM: 'Mumbai',
  IST: 'Istanbul', SAW: 'Istanbul', MAD: 'Madrid', BCN: 'Barcelona',
  FCO: 'Rome', MXP: 'Milan', ZRH: 'Zurich', VIE: 'Vienna', BRU: 'Brussels', LIS: 'Lisbon',
};

function getCityName(iata: string): string {
  return CITY_NAMES[iata?.toUpperCase()] || '';
}

// ─── Aircraft name lookup ─────────────────────────────────────────────────────
function getAircraftName(code: string): string {
  if (!code) return '';
  const map: Record<string, string> = {
    '789': 'Boeing 787-9', '788': 'Boeing 787-8', '77W': 'Boeing 777-300ER',
    '777': 'Boeing 777', '773': 'Boeing 777-300', '738': 'Boeing 737-800',
    '737': 'Boeing 737', '321': 'Airbus A321', '320': 'Airbus A320',
    '319': 'Airbus A319', '359': 'Airbus A350-900', '351': 'Airbus A350-1000',
    '333': 'Airbus A330-300', '332': 'Airbus A330-200',
    'E90': 'Embraer E190', 'E95': 'Embraer E195', 'DH4': 'Dash 8-400',
  };
  return map[code] || code;
}

// ─── Segment field accessors (handles both API formats) ───────────────────────
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
function segDepTerminal(seg: FlightItinerarySegment): string | undefined {
  return seg.departure?.terminal;
}
function segArrTerminal(seg: FlightItinerarySegment): string | undefined {
  return seg.arrival?.terminal;
}
function segFlightNum(seg: FlightItinerarySegment): string {
  if (seg.flight_number) return seg.flight_number;
  if (seg.carrierCode && seg.number) return `${seg.carrierCode}${seg.number}`;
  return '';
}
function segAircraft(seg: FlightItinerarySegment): string {
  return seg.aircraft || '';
}
function segCarrierName(seg: FlightItinerarySegment): string {
  return (seg as any).carrier_name || seg.carrierCode || '';
}

// ─── Formatting helpers ───────────────────────────────────────────────────────
function formatTime(dateStr?: string): string {
  if (!dateStr) return '--:--';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString([], { day: 'numeric', month: 'short' });
}
function minutesToHm(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${m > 0 ? ` ${m}m` : ''}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface FlightListingCardProps {
  offer: FlightOfferResult;
  originCode: string;
  destinationCode: string;
  onBook: () => void;
}

// ─── Leg Row (collapsed) ──────────────────────────────────────────────────────
interface LegRowProps {
  itinerary: FlightOfferResult['itineraries'][0];
  label: string;
  fareDetails: any[];
  isReturn?: boolean;
}

function LegRow({ itinerary, label, fareDetails, isReturn = false }: LegRowProps) {
  const segs = itinerary.segments;
  const first = segs[0];
  const last = segs[segs.length - 1];

  const depCode = segDepCode(first);
  const arrCode = segArrCode(last);
  const depCity = getCityName(depCode);
  const arrCity = getCityName(arrCode);

  const stops = itinerary.stops;
  const isNonStop = stops === 0;
  const stopLabel = isNonStop ? 'Non-stop' : `${stops} stop${stops > 1 ? 's' : ''}`;

  const fd = fareDetails[0];
  const cabinRaw = (fd?.cabin || 'ECONOMY') as string;
  const cabinLabel = cabinRaw.charAt(0) + cabinRaw.slice(1).toLowerCase();
  const classCode = fd?.class;
  const fareClass = classCode ? `${cabinLabel} (${classCode})` : cabinLabel;

  // Colour tokens
  const labelColor = isReturn ? 'text-emerald-600' : 'text-brand-purple';
  const tagColors = isReturn
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : 'text-brand-purple bg-purple-50 border-purple-200';
  const lineColor = isReturn ? 'bg-emerald-200' : 'bg-purple-200';
  const dotLeftColor = isReturn ? 'bg-emerald-400' : 'bg-brand-orange';
  const dotRightColor = isReturn ? 'bg-emerald-600' : 'bg-brand-purple';
  const stopDotColor = 'bg-amber-400';

  return (
    <div className="flex items-center gap-3 sm:gap-4 py-4">
      {/* Departure */}
      <div className="shrink-0 w-[68px] sm:w-24">
        <span className="text-lg sm:text-xl font-black text-slate-900 leading-none block">
          {formatTime(segDepTime(first))}
        </span>
        <span className="text-sm font-black text-slate-600 uppercase block mt-0.5">{depCode}</span>
        {depCity && <span className="text-xs text-slate-400 block">{depCity}</span>}
        <span className="text-xs text-slate-400 block">{formatDate(segDepTime(first))}</span>
      </div>

      {/* Centre: fare badge + route line + meta */}
      <div className="flex-1 flex flex-col items-center min-w-0 px-1">
        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full mb-1 border ${tagColors}`}>
          {label}
        </span>
        <span className="text-xs text-slate-500 font-medium">{itinerary.duration}</span>

        {/* Route line */}
        <div className="w-full flex items-center">
          <div className={`w-2 h-2 rounded-full shrink-0 ${dotLeftColor}`} />
          <div className={`flex-1 h-px relative ${lineColor}`}>
            {!isNonStop && Array.from({ length: stops }).map((_, i) => (
              <div
                key={i}
                className={`absolute top-1/2 w-2 h-2 rounded-full border-2 border-white ${stopDotColor}`}
                style={{ left: `${((i + 1) / (stops + 1)) * 100}%`, transform: 'translate(-50%, -50%)' }}
              />
            ))}
          </div>
          <div className={`w-2 h-2 rounded-full shrink-0 ${dotRightColor}`} />
        </div>
        {/* Duration + stops */}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap justify-center">
          <span className={`text-xs font-black ${isNonStop ? 'text-emerald-500' : 'text-amber-500'}`}>
            {stopLabel}
          </span>
        </div>
      </div>

      {/* Arrival */}
      <div className="shrink-0 w-[68px] sm:w-24 text-right">
        <span className="text-lg sm:text-xl font-black text-slate-900 leading-none block">
          {formatTime(segArrTime(last))}
        </span>
        <span className="text-sm font-black text-slate-600 uppercase block mt-0.5">{arrCode}</span>
        {arrCity && <span className="text-xs text-slate-400 block">{arrCity}</span>}
        <span className="text-xs text-slate-400 block">{formatDate(segArrTime(last))}</span>
      </div>
    </div>
  );
}

// ─── Flight Details Tab ───────────────────────────────────────────────────────
function FlightDetailsTab({
  itineraries,
  fareDetailsBySegment,
  outboundSegCount,
}: {
  itineraries: FlightOfferResult['itineraries'];
  fareDetailsBySegment: any[];
  outboundSegCount: number;
}) {
  return (
    <div className="space-y-6">
      {itineraries.map((itin, itinIdx) => {
        const totalItins = itineraries.length;
        const isReturn = totalItins === 2 && itinIdx === 1;
        const isMultiCity = totalItins > 2 || (totalItins > 1 && !isReturn);

        let legName = isReturn ? 'Return' : 'Outbound';
        if (isMultiCity) legName = `Flight ${itinIdx + 1}`;

        const segs = itin.segments;
        const firstSeg = segs[0];
        const lastSeg = segs[segs.length - 1];

        const headerBg = isReturn ? 'bg-emerald-50 border-emerald-200' : 'bg-purple-50 border-purple-200';
        const headerText = isReturn ? 'text-emerald-700' : 'text-brand-purple';
        const pillBg = isReturn ? 'bg-emerald-500' : 'bg-brand-purple';
        const spineBg = isReturn ? 'bg-emerald-200' : 'bg-purple-200';
        const dotTop = isReturn ? 'bg-emerald-400' : 'bg-brand-orange';
        const dotBottom = isReturn ? 'bg-emerald-600' : 'bg-brand-purple';

        const segIds = segs.map((s: any) => s.id).filter(Boolean);
        const isFares = segIds.length > 0
          ? fareDetailsBySegment.filter((f: any) => segIds.includes(f.segmentId))
          : (isReturn ? fareDetailsBySegment.slice(outboundSegCount) : fareDetailsBySegment.slice(0, outboundSegCount));

        const depCode = segDepCode(firstSeg);
        const arrCode = segArrCode(lastSeg);
        const headerIcon = isReturn ? '🔄' : '✈️';

        return (
          <div key={itinIdx}>
            {/* Itinerary header */}
            <div className={`flex items-center justify-between px-4 py-3 rounded-xl border mb-4 ${headerBg}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span>{headerIcon}</span>
                <span className={`text-sm font-black ${headerText}`}>
                  {legName}: {depCode} → {arrCode}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  · {itin.stops === 0 ? 'Non-stop' : `${itin.stops} stop${itin.stops > 1 ? 's' : ''}`}
                </span>
              </div>
              <span className={`text-sm font-black ${headerText} shrink-0`}>{itin.duration}</span>
            </div>

            {/* Segments */}
            {segs.map((seg, segIdx) => {
              const depAt = segDepTime(seg);
              const arrAt = segArrTime(seg);
              const depCode = segDepCode(seg);
              const arrCode = segArrCode(seg);
              const depTerminal = segDepTerminal(seg);
              const arrTerminal = segArrTerminal(seg);
              const flightNum = segFlightNum(seg);
              const aircraftName = getAircraftName(segAircraft(seg));
              const carrierName = segCarrierName(seg);

              const fd = isFares.find((f: any) => f.segmentId === (seg as any).id) || isFares[segIdx] || null;
              const checkedQty: number | undefined = fd?.includedCheckedBags?.quantity;
              const checkedWeight: number | undefined = fd?.includedCheckedBags?.weight;
              const cabinQty: number | undefined = fd?.includedCabinBags?.quantity;
              const cabinWeight: number | undefined = fd?.includedCabinBags?.weight;
              const fareClass = fd?.class
                ? `${(fd.cabin || 'ECONOMY').charAt(0) + (fd.cabin || 'ECONOMY').slice(1).toLowerCase()} (${fd.class})`
                : (fd?.cabin || '');

              const nextSeg = segs[segIdx + 1];
              let layoverMins = 0;
              if (nextSeg) {
                const nextDep = segDepTime(nextSeg);
                if (arrAt && nextDep) {
                  layoverMins = Math.round(
                    (new Date(nextDep).getTime() - new Date(arrAt).getTime()) / 60000
                  );
                }
              }

              const segLabel = segs.length > 1 ? `${legName} · Segment ${segIdx + 1}` : legName;

              return (
                <div key={segIdx} className="mb-4">
                  {/* Segment pill */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-black text-white px-3 py-1 rounded-full ${pillBg}`}>
                      {segLabel}
                    </span>
                  </div>

                  {/* Segment card */}
                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    {/* Departure */}
                    <div className="flex items-start gap-3 px-4 pt-4 pb-3 bg-white">
                      <div className="flex flex-col items-center shrink-0 mt-0.5">
                        <div className={`w-3 h-3 rounded-full ${dotTop}`} />
                        <div className={`w-0.5 min-h-[28px] flex-1 mt-1.5 ${spineBg}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Departure</span>
                          <span className="text-xs text-slate-400 font-medium shrink-0">{formatDate(depAt)}</span>
                        </div>
                        <span className="text-xl font-black text-slate-900 block">{formatTime(depAt)}</span>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-sm font-black text-slate-700 uppercase">{depCode}</span>
                          {getCityName(depCode) && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="text-sm text-slate-500">{getCityName(depCode)}</span>
                            </>
                          )}
                          {depTerminal && (
                            <span className="text-xs bg-purple-50 text-brand-purple font-bold px-2 py-0.5 rounded-full border border-purple-100">
                              T{depTerminal}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Flight details inner card */}
                    <div className="mx-3 my-1 border border-dashed border-slate-200 rounded-xl bg-slate-50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {carrierName && (
                          <span className="text-sm font-black text-slate-800">✈️ {carrierName}</span>
                        )}
                        {flightNum && (
                          <span className="text-xs text-slate-400 font-medium">· Flight {flightNum}</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        {seg.duration && (
                          <div>
                            <span className="text-xs text-slate-400 block mb-0.5">Duration</span>
                            <span className="text-sm font-black text-slate-700">{seg.duration}</span>
                          </div>
                        )}
                        {fareClass && (
                          <div>
                            <span className="text-xs text-slate-400 block mb-0.5">Class</span>
                            <span className="text-sm font-black text-slate-700">{fareClass}</span>
                          </div>
                        )}
                        {cabinQty !== undefined && (
                          <div>
                            <span className="text-xs text-slate-400 block mb-0.5">Cabin Bag</span>
                            <span className="text-sm font-black text-slate-700">
                              {cabinQty} PC{cabinWeight ? ` · ${cabinWeight}kg` : ''}
                            </span>
                          </div>
                        )}
                        {checkedQty !== undefined && (
                          <div>
                            <span className="text-xs text-slate-400 block mb-0.5">Checked Baggage</span>
                            <span className="text-sm font-black text-slate-700">
                              {checkedQty} PC{checkedWeight ? ` · ${checkedWeight}kg` : ''}
                            </span>
                          </div>
                        )}
                        {aircraftName && (
                          <div>
                            <span className="text-xs text-slate-400 block mb-0.5">Aircraft</span>
                            <span className="text-sm font-black text-slate-700">{aircraftName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Arrival */}
                    <div className="flex items-start gap-3 px-4 pt-3 pb-4 bg-white">
                      <div className="shrink-0 mt-0.5">
                        <div className={`w-3 h-3 rounded-full ${dotBottom}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Arrival</span>
                          <span className="text-xs text-slate-400 font-medium shrink-0">{formatDate(arrAt)}</span>
                        </div>
                        <span className="text-xl font-black text-slate-900 block">{formatTime(arrAt)}</span>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-sm font-black text-slate-700 uppercase">{arrCode}</span>
                          {getCityName(arrCode) && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="text-sm text-slate-500">{getCityName(arrCode)}</span>
                            </>
                          )}
                          {arrTerminal && (
                            <span className="text-xs bg-purple-50 text-brand-purple font-bold px-2 py-0.5 rounded-full border border-purple-100">
                              T{arrTerminal}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Layover banner */}
                  {nextSeg && layoverMins > 0 && (
                    <div className="flex items-center gap-3 my-3">
                      <div className="flex-1 h-px bg-amber-200" />
                      <div className="bg-amber-50 border border-amber-200 rounded-full px-4 py-2 flex items-center gap-2 shrink-0">
                        <span>⏱</span>
                        <span className="text-xs font-black text-amber-700">
                          {minutesToHm(layoverMins)} layover · {arrCode}
                        </span>
                      </div>
                      <div className="flex-1 h-px bg-amber-200" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── Baggage Tab ──────────────────────────────────────────────────────────────
function BaggageTab({
  itineraries,
  fareDetailsBySegment,
}: {
  itineraries: FlightOfferResult['itineraries'];
  fareDetailsBySegment: any[];
}) {
  const firstFd = fareDetailsBySegment[0];
  const summaryChecked: number | undefined = firstFd?.includedCheckedBags?.quantity;
  const summaryCheckedW: number | undefined = firstFd?.includedCheckedBags?.weight;
  const summaryCabin: number | undefined = firstFd?.includedCabinBags?.quantity;
  const summaryCabinW: number | undefined = firstFd?.includedCabinBags?.weight;

  // Per-segment rows
  const rows: {
    label: string; isReturn: boolean; route: string;
    flightNum: string; cabinQty?: number; cabinW?: number; checkedQty?: number; checkedW?: number;
  }[] = [];

  let offset = 0;
  itineraries.forEach((itin, itinIdx) => {
    const isReturn = itinIdx > 0;
    itin.segments.forEach((seg) => {
      const fd = fareDetailsBySegment.find((f: any) => f.segmentId === (seg as any).id)
        || fareDetailsBySegment[offset]
        || null;
      rows.push({
        label: isReturn ? 'Return' : 'Outbound',
        isReturn,
        route: `${segDepCode(seg)} → ${segArrCode(seg)}`,
        flightNum: segFlightNum(seg),
        cabinQty: fd?.includedCabinBags?.quantity,
        cabinW: fd?.includedCabinBags?.weight,
        checkedQty: fd?.includedCheckedBags?.quantity,
        checkedW: fd?.includedCheckedBags?.weight,
      });
      offset++;
    });
  });

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        {summaryChecked !== undefined && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <span className="text-2xl shrink-0">🧳</span>
            <div>
              <span className="text-xs text-blue-600 font-black uppercase tracking-wider block">Checked Baggage</span>
              <span className="text-base font-black text-slate-800">
                {summaryChecked} PC{summaryCheckedW ? ` · ${summaryCheckedW}kg` : ''}
              </span>
            </div>
          </div>
        )}
        {summaryCabin !== undefined && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <span className="text-2xl shrink-0">🎒</span>
            <div>
              <span className="text-xs text-emerald-700 font-black uppercase tracking-wider block">Cabin Baggage</span>
              <span className="text-base font-black text-slate-800">
                {summaryCabin} PC{summaryCabinW ? ` · ${summaryCabinW}kg` : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Per-segment table */}
      {rows.length > 0 && (
        <div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">By Segment</span>
          <div className="space-y-2">
            {rows.map((row, i) => (
              <div key={i} className="flex items-center gap-3 py-3 px-4 bg-white border border-slate-100 rounded-xl flex-wrap">
                <span className={`text-xs font-black px-2.5 py-1 rounded-full shrink-0 ${row.isReturn ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-brand-purple'}`}>
                  {row.label}
                </span>
                <span className="text-sm font-black text-slate-700 flex-1">{row.route}</span>
                {row.flightNum && (
                  <span className="text-xs text-slate-400 font-medium">{row.flightNum}</span>
                )}
                <div className="flex items-center gap-3 ml-auto">
                  {row.cabinQty !== undefined && (
                    <span className="text-xs text-slate-600 font-bold flex items-center gap-1">
                      🎒 {row.cabinQty}PC{row.cabinW ? ` · ${row.cabinW}kg` : ''}
                    </span>
                  )}
                  {row.checkedQty !== undefined && (
                    <span className="text-xs text-slate-600 font-bold flex items-center gap-1">
                      🧳 {row.checkedQty}PC{row.checkedW ? ` · ${row.checkedW}kg` : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3 leading-relaxed">
            Allowances are as supplied by the airline and may change. Excess baggage is charged at the airport.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Fare Rules Tab ───────────────────────────────────────────────────────────
function FareRulesTab({
  fareRules,
  fareDetailsBySegment,
  lastTicketingDate,
  seatsLeft,
}: {
  fareRules: Array<{ category: string; maxPenaltyAmount?: string; notApplicable?: boolean }>;
  fareDetailsBySegment: any[];
  lastTicketingDate?: string;
  seatsLeft: number;
}) {
  const fd = fareDetailsBySegment[0];
  const fareType = fd?.brandedFareLabel || fd?.brandedFare || '';
  const bookingClasses = [...new Set(fareDetailsBySegment.map((f: any) => f.class).filter(Boolean))].join(', ');
  const seatsUrgent = seatsLeft > 0 && seatsLeft <= 5;

  // Unique amenities across all segments
  const amenityMap = new Map<string, boolean>();
  fareDetailsBySegment.forEach((f: any) => {
    (f.amenities || []).forEach((a: any) => {
      if (!amenityMap.has(a.description)) amenityMap.set(a.description, a.isChargeable);
    });
  });
  const amenities = Array.from(amenityMap.entries());

  return (
    <div className="space-y-5">
      {/* Fare Details grid */}
      <div className="border border-slate-100 rounded-2xl p-5 space-y-5">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Fare Details</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {fareType && (
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Fare type</span>
              <span className="text-sm font-black text-slate-800">{fareType}</span>
            </div>
          )}
          {bookingClasses && (
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Booking class</span>
              <span className="text-sm font-black text-slate-800">{bookingClasses}</span>
            </div>
          )}
          {seatsLeft > 0 && (
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Seats left</span>
              <span className={`text-sm font-black ${seatsUrgent ? 'text-rose-500' : 'text-slate-800'}`}>
                {seatsLeft}{seatsUrgent ? ' (few left)' : ''}
              </span>
            </div>
          )}
          {lastTicketingDate && (
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Ticket by</span>
              <span className="text-sm font-black text-slate-800">{lastTicketingDate}</span>
            </div>
          )}
        </div>

        {/* Change / Refund rules */}
        {fareRules.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            {fareRules.map((rule, i) => {
              const label =
                rule.category === 'EXCHANGE' ? 'Change Before Departure' :
                rule.category === 'REFUND' ? 'Refund / Cancellation' :
                rule.category === 'REVALIDATION' ? 'Re-validation' :
                rule.category;
              return (
                <div key={i} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-600 font-medium">{label}</span>
                  {rule.notApplicable ? (
                    <span className="text-xs text-emerald-700 font-black bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
                      Not applicable
                    </span>
                  ) : (
                    <span className="text-xs text-rose-700 font-black bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full shrink-0">
                      Max ₦{Number(rule.maxPenaltyAmount).toLocaleString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* What's Included — amenity chips */}
      {amenities.length > 0 && (
        <div className="border border-slate-100 rounded-2xl p-5">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">What&apos;s Included</span>
          <div className="flex flex-wrap gap-2">
            {amenities.map(([desc, isChargeable], i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
                  isChargeable
                    ? 'text-amber-700 bg-amber-50 border-amber-200'
                    : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                }`}
              >
                <span className="font-black text-[11px]">{isChargeable ? '$' : '✓'}</span>
                {desc.charAt(0) + desc.slice(1).toLowerCase()}
              </span>
            ))}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-5 mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 block" />
              <span className="text-xs text-slate-400">Included</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 block" />
              <span className="text-xs text-slate-400">Chargeable</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Fare rules are supplied by the airline and are subject to change until the ticket is issued. Penalty amounts shown are the maximum that may apply.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Card ────────────────────────────────────────────────────────────────

/** Shared price/CTA block — extracted as a named component to prevent
 *  re-mounting on every FlightListingCard render cycle. */
function PriceBlock({
  price,
  seatsLeft,
  seatsUrgent,
  isBooking,
  onBook,
  className = '',
}: {
  price: number | string;
  seatsLeft: number;
  seatsUrgent: boolean;
  isBooking: boolean;
  onBook: () => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">All taxes incl.</span>
      <strong className="text-xl sm:text-2xl font-black text-brand-purple block leading-tight mt-0.5">
        ₦{Number(price).toLocaleString()}
      </strong>
      {seatsLeft > 0 && (
        <span className={`text-xs font-bold block mt-1 ${seatsUrgent ? 'text-rose-500 font-black' : 'text-slate-400'}`}>
          {seatsUrgent ? `🔥 Only ${seatsLeft} seats left!` : `${seatsLeft} seats avail.`}
        </span>
      )}
      <button
        type="button"
        disabled={isBooking}
        onClick={(e) => {
          e.stopPropagation();
          if (isBooking) return;
          onBook();
        }}
        className="mt-4 w-full bg-brand-orange hover:bg-brand-purple text-white font-black px-5 py-3 rounded-xl text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5 cursor-pointer border-none shadow-sm disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:bg-brand-orange flex items-center justify-center space-x-2"
      >
        {isBooking ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </>
        ) : (
          <span>Book Flight</span>
        )}
      </button>
    </div>
  );
}

export default function FlightListingCard({
  offer,
  originCode,
  destinationCode,
  onBook,
}: FlightListingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'baggage' | 'fares'>('details');
  const [isBooking, setIsBooking] = useState(false);

  const isRoundTrip = offer.itineraries.length > 1;
  const outbound = offer.itineraries[0];
  const returnLeg = offer.itineraries[1];

  const seatsLeft = offer.seats_available;
  const seatsUrgent = seatsLeft > 0 && seatsLeft <= 5;

  const raw = offer.raw_offer;
  const fareDetailsBySegment: any[] = raw?.travelerPricings?.[0]?.fareDetailsBySegment || [];
  const fareRules: Array<{ category: string; maxPenaltyAmount?: string; notApplicable?: boolean }> =
    raw?.fareRules?.rules || [];
  const lastTicketingDate: string | undefined = raw?.lastTicketingDate;

  const outboundSegCount = outbound?.segments?.length || 0;

  const outboundSegIds = outbound?.segments?.map((s: any) => s.id).filter(Boolean) || [];
  const returnSegIds = returnLeg?.segments?.map((s: any) => s.id).filter(Boolean) || [];

  const outboundFares = outboundSegIds.length > 0
    ? fareDetailsBySegment.filter((f: any) => outboundSegIds.includes(f.segmentId))
    : fareDetailsBySegment.slice(0, outboundSegCount);

  const returnFares = returnSegIds.length > 0
    ? fareDetailsBySegment.filter((f: any) => returnSegIds.includes(f.segmentId))
    : fareDetailsBySegment.slice(outboundSegCount);

  const firstFd = fareDetailsBySegment[0];
  const quickCabinBags: number | undefined = firstFd?.includedCabinBags?.quantity;
  const quickCheckedBags: number | undefined = firstFd?.includedCheckedBags?.quantity;
  const fareLabel: string | undefined = firstFd?.brandedFareLabel;

  const tabs = [
    { id: 'details' as const, label: 'Flight Details' },
    { id: 'baggage' as const, label: 'Baggage' },
    { id: 'fares' as const, label: 'Fare Rules' },
  ];

  // Wrap onBook to set isBooking state — resetting is handled by parent via key prop
  const handleBook = () => {
    setIsBooking(true);
    onBook();
  };

  return (
    <div className="bg-white border border-purple-100/70 rounded-3xl overflow-hidden transition-all hover:border-brand-purple/20 hover:shadow-xl hover:shadow-purple-100/40">

      {/* ── Collapsed: main layout ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row">

        {/* Left: airline + legs + meta */}
        <div className="flex-1 px-5 sm:px-6 pt-5 sm:pt-6 pb-4 min-w-0">

          {/* Airline header row */}
          <div className="flex items-center gap-3 mb-1 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-xl border border-purple-100 shrink-0">
              ✈️
            </div>
            <div className="min-w-0">
              <span className="text-sm font-black text-brand-orange block leading-tight">{offer.airline}</span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">
                {offer.airline_code} · {offer.cabin}{fareLabel ? ` · ${fareLabel}` : ''}
              </span>
            </div>
          </div>

          {/* Render all itinerary legs dynamically (One-Way, Round-Trip, or Multi-City) */}
          {offer.itineraries.map((itin, itinIdx) => {
            const totalItins = offer.itineraries.length;
            const isReturnLeg = totalItins === 2 && itinIdx === 1;
            const isMultiLeg = totalItins > 2 || (totalItins > 1 && !isReturnLeg);

            let legLabel = 'Outbound';
            if (isReturnLeg) legLabel = 'Return';
            else if (isMultiLeg) legLabel = `Flight ${itinIdx + 1}`;

            const legSegIds = itin.segments?.map((s: any) => s.id).filter(Boolean) || [];
            const legFares = legSegIds.length > 0
              ? fareDetailsBySegment.filter((f: any) => legSegIds.includes(f.segmentId))
              : fareDetailsBySegment;

            return (
              <React.Fragment key={itinIdx}>
                {itinIdx > 0 && <div className="h-px bg-slate-100" />}
                <LegRow
                  itinerary={itin}
                  label={legLabel}
                  fareDetails={legFares}
                  isReturn={isReturnLeg}
                />
              </React.Fragment>
            );
          })}

          {/* Meta row + toggle */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {quickCabinBags !== undefined && (
                <span className="text-xs text-slate-600 font-bold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                  🎒 {quickCabinBags}×{firstFd?.includedCabinBags?.weight || 7}kg cabin
                </span>
              )}
              {quickCheckedBags !== undefined && (
                <span className="text-xs text-slate-600 font-bold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                  🧳 {quickCheckedBags}×{firstFd?.includedCheckedBags?.weight || 23}kg checked
                </span>
              )}
              {lastTicketingDate && (
                <span className="text-xs text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                  📅 Book by {new Date(lastTicketingDate).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(prev => !prev)}
              className="flex items-center gap-1.5 text-sm font-black text-brand-purple hover:text-brand-orange transition-colors cursor-pointer border-none bg-transparent p-0 ml-auto whitespace-nowrap"
            >
              <span>{isExpanded ? 'Hide flight details' : 'View flight details'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"
                className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right: price panel (md+) */}
        <PriceBlock
          price={offer.price}
          seatsLeft={seatsLeft}
          seatsUrgent={seatsUrgent}
          isBooking={isBooking}
          onBook={handleBook}
          className="hidden md:flex md:flex-col md:items-end md:justify-center border-l border-purple-100 px-6 py-6 min-w-[196px] bg-purple-50/20 shrink-0 text-right"
        />

        {/* Bottom: price strip (mobile) */}
        <div className="md:hidden border-t border-purple-50 px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">All taxes incl.</span>
            <strong className="text-xl font-black text-brand-purple block leading-tight">
              ₦{Number(offer.price).toLocaleString()}
            </strong>
            {seatsLeft > 0 && (
              <span className={`text-xs font-bold block mt-0.5 ${seatsUrgent ? 'text-rose-500' : 'text-slate-400'}`}>
                {seatsUrgent ? `🔥 Only ${seatsLeft} seats!` : `${seatsLeft} seats avail.`}
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={isBooking}
            onClick={(e) => {
              e.stopPropagation();
              if (isBooking) return;
              handleBook();
            }}
            className="bg-brand-orange hover:bg-brand-purple text-white font-black px-5 py-3 rounded-xl text-sm uppercase tracking-wider transition-all cursor-pointer border-none shadow-sm whitespace-nowrap disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:bg-brand-orange flex items-center justify-center space-x-2"
          >
            {isBooking ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <span>Book Flight</span>
            )}
          </button>
        </div>
      </div>

      {/* ── Expanded panel with tabs ──────────────────────────────────── */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="border-t border-purple-100/60">

          {/* Tab bar */}
          <div className="flex items-center border-b border-slate-100 bg-white px-5 sm:px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3.5 text-sm font-black border-b-2 -mb-px transition-all cursor-pointer border-x-0 border-t-0 bg-transparent whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-brand-purple text-brand-purple'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5 sm:p-6 bg-gradient-to-b from-slate-50/60 to-white">
            {activeTab === 'details' && (
              <FlightDetailsTab
                itineraries={offer.itineraries}
                fareDetailsBySegment={fareDetailsBySegment}
                outboundSegCount={outboundSegCount}
              />
            )}
            {activeTab === 'baggage' && (
              <BaggageTab
                itineraries={offer.itineraries}
                fareDetailsBySegment={fareDetailsBySegment}
              />
            )}
            {activeTab === 'fares' && (
              <FareRulesTab
                fareRules={fareRules}
                fareDetailsBySegment={fareDetailsBySegment}
                lastTicketingDate={lastTicketingDate}
                seatsLeft={seatsLeft}
              />
            )}

            {/* Bottom CTA */}
            <div className="flex items-center justify-between gap-4 pt-6 mt-6 border-t border-slate-100 flex-wrap">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total (all taxes included)</span>
                <strong className="text-xl font-black text-brand-purple">
                  ₦{Number(offer.price).toLocaleString()}
                </strong>
                {seatsUrgent && (
                  <span className="text-sm text-rose-500 font-black block mt-1">
                    🔥 Only {seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} left at this price!
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={isBooking}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isBooking) return;
                  handleBook();
                }}
                className="bg-brand-orange hover:bg-brand-purple text-white font-black px-8 py-3.5 rounded-xl text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5 cursor-pointer border-none shadow-md disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:bg-brand-orange flex items-center justify-center space-x-2"
              >
                {isBooking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Book Flight</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
