"use client";

import React from 'react';

interface FlightListingCardProps {
  flight: {
    id: string;
    logo: string;
    carrier: string;
    number: string;
    dep: string;
    duration: string;
    stops: string;
    arr: string;
    price: number;
  };
  originName: string;
  destinationName: string;
  onBook: (item: { type: string; name: string; price: number }) => void;
  onSelect?: (flight: any) => void;
}

export default function FlightListingCard({
  flight,
  originName,
  destinationName,
  onBook,
  onSelect
}: FlightListingCardProps) {
  return (
    <div
      onClick={() => onSelect && onSelect(flight)}
      className="bg-white hover:bg-[#F6EFF7]/10 transition-all rounded-3xl p-6 border border-purple-100/60 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer hover:border-brand-purple/40"
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
          onClick={(e) => {
            e.stopPropagation();
            onBook({ type: 'flight', name: flight.carrier, price: flight.price });
          }}
          className="bg-brand-orange hover:bg-brand-purple text-white font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all hover:-translate-y-0.5 cursor-pointer border-none"
        >
          Book Flight
        </button>
      </div>
    </div>
  );
}
