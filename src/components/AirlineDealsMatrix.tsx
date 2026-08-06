"use client";

import React, { useMemo } from 'react';

interface FlightOfferItem {
  offer_id: string;
  airline: string;
  airline_code: string;
  price: number;
  itineraries?: Array<{
    duration?: string;
    stops?: number;
    segments?: Array<{
      departure?: { at?: string; iataCode?: string };
      arrival?: { at?: string; iataCode?: string };
    }>;
  }>;
}

interface AirlineDealsMatrixProps {
  offers: FlightOfferItem[];
  originCode: string;
  destinationCode: string;
  selectedAirline: string | null;
  selectedStops: number | null;
  onFilterChange: (airline: string | null, stops: number | null) => void;
}

export default function AirlineDealsMatrix({
  offers,
  originCode,
  destinationCode,
  selectedAirline,
  selectedStops,
  onFilterChange,
}: AirlineDealsMatrixProps) {
  // Aggregate price matrix by airline and stops count
  const matrixData = useMemo(() => {
    if (!offers || offers.length === 0) return [];

    const map = new Map<string, {
      airlineName: string;
      airlineCode: string;
      nonStopMin: number | null;
      oneStopMin: number | null;
      twoPlusStopMin: number | null;
      overallMin: number;
    }>();

    offers.forEach(offer => {
      const code = offer.airline_code || offer.airline || 'FL';
      const name = offer.airline || 'Airline';
      const price = Number(offer.price) || 0;
      const stops = (offer as any).max_stops_in_trip ?? offer.itineraries?.[0]?.stops ?? 0;

      if (!map.has(code)) {
        map.set(code, {
          airlineName: name,
          airlineCode: code,
          nonStopMin: null,
          oneStopMin: null,
          twoPlusStopMin: null,
          overallMin: price,
        });
      }

      const entry = map.get(code)!;
      entry.overallMin = Math.min(entry.overallMin, price);

      if (stops === 0) {
        entry.nonStopMin = entry.nonStopMin === null ? price : Math.min(entry.nonStopMin, price);
      } else if (stops === 1) {
        entry.oneStopMin = entry.oneStopMin === null ? price : Math.min(entry.oneStopMin, price);
      } else {
        entry.twoPlusStopMin = entry.twoPlusStopMin === null ? price : Math.min(entry.twoPlusStopMin, price);
      }
    });

    // Sort airlines from cheapest to most expensive
    return Array.from(map.values()).sort((a, b) => a.overallMin - b.overallMin);
  }, [offers]);

  if (matrixData.length === 0) return null;

  const isFilterActive = selectedAirline !== null || selectedStops !== null;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-purple-100 shadow-sm mb-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-purple-100 text-brand-purple font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              Best Deals by Airline
            </span>
            <span className="text-xs text-slate-400 font-bold">
              {originCode} → {destinationCode} • Cheapest fares at a glance
            </span>
          </div>
          <h4 className="text-base font-black text-brand-purple mt-1">
            Compare Fares Across Carriers &amp; Stops
          </h4>
        </div>

        {isFilterActive && (
          <button
            type="button"
            onClick={() => onFilterChange(null, null)}
            className="self-start sm:self-auto text-xs font-extrabold text-brand-orange hover:text-brand-purple bg-orange-50 hover:bg-purple-50 px-3.5 py-1.5 rounded-full transition-all border border-orange-100 cursor-pointer"
          >
            Show All Deals ✕
          </button>
        )}
      </div>

      {/* Horizontal Scrollable Table Grid */}
      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-200">
        <table className="w-full min-w-[650px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-purple-100">
              <th className="p-3 w-32 bg-slate-50/50 rounded-tl-2xl font-black text-slate-400 uppercase text-[10px] tracking-wider">
                Stops / Airline
              </th>
              {matrixData.map(item => {
                const isSelected = selectedAirline === item.airlineCode;
                return (
                  <th
                    key={item.airlineCode}
                    onClick={() => onFilterChange(isSelected ? null : item.airlineCode, selectedStops)}
                    className={`p-3 text-center cursor-pointer transition-all border-l border-purple-50 hover:bg-purple-50/40 ${
                      isSelected ? 'bg-purple-100/60 ring-2 ring-brand-purple/20' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center font-black text-brand-purple text-xs shadow-xs">
                        {item.airlineCode.slice(0, 2)}
                      </div>
                      <span className="font-extrabold text-slate-800 text-xs line-clamp-1">
                        {item.airlineName}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50">
            {/* Non stop row */}
            <tr>
              <td className="p-3 font-extrabold text-slate-700 bg-slate-50/30">Non stop</td>
              {matrixData.map(item => {
                const price = item.nonStopMin;
                const isSelected = selectedAirline === item.airlineCode && selectedStops === 0;
                return (
                  <td
                    key={item.airlineCode}
                    onClick={() => price && onFilterChange(item.airlineCode, 0)}
                    className={`p-3 text-center transition-all border-l border-purple-50 ${
                      price ? 'cursor-pointer hover:bg-amber-50/60 font-bold text-slate-900' : 'text-slate-300'
                    } ${isSelected ? 'bg-amber-100 ring-2 ring-brand-orange' : ''}`}
                  >
                    {price ? (
                      <span className="text-brand-purple font-black">
                        ₦{price.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* 1 Stop row */}
            <tr>
              <td className="p-3 font-extrabold text-slate-700 bg-slate-50/30">1 Stop</td>
              {matrixData.map(item => {
                const price = item.oneStopMin;
                const isSelected = selectedAirline === item.airlineCode && selectedStops === 1;
                return (
                  <td
                    key={item.airlineCode}
                    onClick={() => price && onFilterChange(item.airlineCode, 1)}
                    className={`p-3 text-center transition-all border-l border-purple-50 ${
                      price ? 'cursor-pointer hover:bg-amber-50/60 font-bold text-slate-900' : 'text-slate-300'
                    } ${isSelected ? 'bg-amber-100 ring-2 ring-brand-orange' : ''}`}
                  >
                    {price ? (
                      <span className="text-brand-purple font-black">
                        ₦{price.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* 2+ Stops row */}
            <tr>
              <td className="p-3 font-extrabold text-slate-700 bg-slate-50/30 rounded-bl-2xl">2+ Stops</td>
              {matrixData.map(item => {
                const price = item.twoPlusStopMin;
                const isSelected = selectedAirline === item.airlineCode && selectedStops === 2;
                return (
                  <td
                    key={item.airlineCode}
                    onClick={() => price && onFilterChange(item.airlineCode, 2)}
                    className={`p-3 text-center transition-all border-l border-purple-50 ${
                      price ? 'cursor-pointer hover:bg-amber-50/60 font-bold text-slate-900' : 'text-slate-300'
                    } ${isSelected ? 'bg-amber-100 ring-2 ring-brand-orange' : ''}`}
                  >
                    {price ? (
                      <span className="text-brand-purple font-black">
                        ₦{price.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
