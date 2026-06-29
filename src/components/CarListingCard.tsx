"use client";

import React from 'react';

interface CarListingCardProps {
  car: {
    id: string;
    image: string;
    name: string;
    desc: string;
    price: number;
  };
  onBook: (item: { type: string; name: string; price: number }) => void;
}

export default function CarListingCard({ car, onBook }: CarListingCardProps) {
  return (
    <div
      className="bg-white hover:bg-[#F6EFF7]/10 transition-all rounded-3xl p-6 border border-purple-100/60 flex flex-col md:flex-row items-center justify-between gap-6"
    >
      <div className="flex items-center space-x-4 self-start md:self-center">
        <img
          src={car.image}
          alt={car.name}
          className="w-20 h-20 rounded-2xl object-cover border border-purple-100"
        />
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
          className="bg-brand-orange hover:bg-brand-purple text-white font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all hover:-translate-y-0.5 cursor-pointer border-none"
        >
          Hire Vehicle
        </button>
      </div>
    </div>
  );
}
