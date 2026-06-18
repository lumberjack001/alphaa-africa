"use client";

import React from 'react';
import {
  AIR_OFFERS_MOCK,
  HOTEL_OFFERS_MOCK,
  CAR_OFFERS_MOCK,
  AIRPORT_REGISTRY
} from '../constants/mockData';

interface ListingsProps {
  activeTab: string;
  isVisible: boolean;
  isLoading: boolean;
  onReset: () => void;
  onBook: (item: { type: string; name: string; price: number }) => void;
  origin: string;
  destination: string;
}

export default function Listings({
  activeTab,
  isVisible,
  isLoading,
  onReset,
  onBook,
  origin,
  destination
}: ListingsProps) {
  if (!isVisible) return null;

  // Resolve City name from Airport registry if available
  const getCityName = (code: string) => {
    const registry = AIRPORT_REGISTRY.find(item => item.code === code);
    return registry ? registry.city : code;
  };

  const originName = getCityName(origin);
  const destinationName = getCityName(destination);

  return (
    <section id="listings-viewports" className="max-w-7xl mx-auto py-12 px-4 sm:px-8 text-left">
      
      {/* Top listings navigation metadata */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-purple-100">
        <div>
          <span className="text-xs text-brand-orange font-black uppercase tracking-wider block mb-1">Available Matches</span>
          <h3 className="text-xl sm:text-2xl font-black text-brand-purple uppercase tracking-tight font-sans">Active Provider Quotes</h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-bold text-slate-400 hover:text-brand-orange underline cursor-pointer"
        >
          Reset Search Filters
        </button>
      </div>

      {/* Live simulated loader animation skeleton */}
      {isLoading ? (
        <div id="loading-gds-skeleton" className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-purple-50 animate-pulse flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-slate-100 rounded"></div>
                  <div className="w-16 h-3 bg-slate-55 rounded"></div>
                </div>
              </div>
              <div className="w-48 h-8 bg-slate-50 rounded"></div>
              <div className="w-32 h-10 bg-slate-100 rounded-2xl"></div>
            </div>
          ))}
        </div>
      ) : (
        <div id="aggregator-matches-grid" className="space-y-4">
          
          {/* Flight Listings */}
          {activeTab === 'flights' &&
            AIR_OFFERS_MOCK.map((flight) => (
              <div
                key={flight.id}
                className="bg-white hover:bg-[#F6EFF7]/10 transition-all rounded-3xl p-6 border border-purple-100/60 flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center space-x-4 self-start md:self-center">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl border border-purple-100">
                    {flight.logo}
                  </div>
                  <div>
                    <span className="text-xs text-brand-orange font-black block">{flight.carrier}</span>
                    <span className="text-[9px] text-slate-400 font-bold block">{flight.number}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <span className="text-base font-black text-brand-purple block">{flight.dep}</span>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">{originName}</span>
                  </div>
                  <div className="text-center px-4">
                    <span className="text-[10px] text-slate-400 block">{flight.duration}</span>
                    <div className="w-16 h-0.5 bg-purple-200 my-1 relative">
                      <div className="w-2 h-2 rounded-full bg-brand-orange absolute top-1/2 left-1/2 -translate-y-1/2"></div>
                    </div>
                    <span className="text-[9px] text-emerald-500 block font-bold">{flight.stops}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-base font-black text-brand-purple block">{flight.arr}</span>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">{destinationName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-purple-50">
                  <div className="text-left md:text-right">
                    <span className="text-[9px] text-slate-400 block">All Taxes Inclusive</span>
                    <strong className="text-xl sm:text-2xl font-black text-brand-purple block">
                      ₦{flight.price.toLocaleString()}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => onBook({ type: 'flight', name: flight.carrier, price: flight.price })}
                    className="bg-brand-orange hover:bg-brand-purple text-white font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Book Flight
                  </button>
                </div>
              </div>
            ))}

          {/* Hotel Listings */}
          {activeTab === 'hotels' &&
            HOTEL_OFFERS_MOCK.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white hover:bg-[#F6EFF7]/10 transition-all rounded-3xl p-6 border border-purple-100/60 flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center space-x-4 self-start md:self-center">
                  <img src={hotel.image} alt={hotel.name} className="w-20 h-20 rounded-2xl object-cover border border-purple-100" />
                  <div>
                    <span className="text-[9px] text-brand-orange uppercase font-bold block">📍 {hotel.location}</span>
                    <h4 className="text-base font-extrabold text-brand-purple leading-tight">{hotel.name}</h4>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {hotel.rating} • Aggregator Option Verified
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-purple-50">
                  <div className="text-left md:text-right">
                    <span className="text-[9px] text-slate-400 block">Price / Night</span>
                    <strong className="text-xl sm:text-2xl font-black text-brand-purple block">
                      ₦{hotel.price.toLocaleString()}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => onBook({ type: 'hotel reservation', name: hotel.name, price: hotel.price })}
                    className="bg-brand-orange hover:bg-brand-purple text-white font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Reserve Hotel
                  </button>
                </div>
              </div>
            ))}

          {/* Vehicle Hire Listings */}
          {activeTab === 'cars' &&
            CAR_OFFERS_MOCK.map((car) => (
              <div
                key={car.id}
                className="bg-white hover:bg-[#F6EFF7]/10 transition-all rounded-3xl p-6 border border-purple-100/60 flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center space-x-4 self-start md:self-center">
                  <img src={car.image} alt={car.name} className="w-20 h-20 rounded-2xl object-cover border border-purple-100" />
                  <div>
                    <span className="text-[9px] text-brand-orange uppercase font-bold block">🚗 Alphaa Fleet Selection</span>
                    <h4 className="text-base font-extrabold text-brand-purple leading-tight">{car.name}</h4>
                    <span className="text-[10px] text-slate-400 block mt-1">{car.desc}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-purple-50">
                  <div className="text-left md:text-right">
                    <span className="text-[9px] text-slate-400 block">Daily Hire Rate</span>
                    <strong className="text-xl sm:text-2xl font-black text-brand-purple block">
                      ₦{car.price.toLocaleString()}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => onBook({ type: 'vehicle hire', name: car.name, price: car.price })}
                    className="bg-brand-orange hover:bg-brand-purple text-white font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Hire Vehicle
                  </button>
                </div>
              </div>
            ))}

        </div>
      )}

    </section>
  );
}
