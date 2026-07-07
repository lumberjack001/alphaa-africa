"use client";

import React from 'react';
import { CarCard } from '@/services/carService';

interface CarListingCardProps {
  car: CarCard;
  onBook: (item: { type: string; name: string; price: number; payload?: any }) => void;
  onSelect?: (car: CarCard) => void;
}

export default function CarListingCard({ car, onBook, onSelect }: CarListingCardProps) {
  const rate = Number(car.hourly_rate);

  return (
    <div
      onClick={() => onSelect && onSelect(car)}
      className="bg-white hover:bg-[#F6EFF7]/10 transition-all rounded-3xl p-6 border border-purple-100/60 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer hover:border-brand-purple/40"
    >
      <div className="flex items-center space-x-4 self-start md:self-center">
        <img
          src={car.main_image}
          alt={car.name}
          className="w-20 h-20 rounded-2xl object-cover border border-purple-100"
        />
        <div>
          <span className="text-[9px] text-brand-orange uppercase font-bold block">
            🚗 {car.vehicle_type_display}
          </span>
          <h4 className="text-base font-extrabold text-brand-purple leading-tight">{car.name}</h4>
          <span className="text-[10px] text-slate-400 block mt-1">
            Capacity: {car.capacity} Passengers • Location: {car.city}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-purple-50">
        <div className="text-left md:text-right">
          <span className="text-[9px] text-slate-400 block">Hourly Hire Rate</span>
          <strong className="text-xl sm:text-2xl font-black text-brand-purple block">
            ₦{rate.toLocaleString()}/hr
          </strong>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBook({ 
              type: 'vehicle', 
              name: car.name, 
              price: rate,
              payload: { vehicle_id: car.id, slug: car.slug }
            });
          }}
          className="bg-brand-orange hover:bg-brand-purple text-white font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all hover:-translate-y-0.5 cursor-pointer border-none"
        >
          Hire Vehicle
        </button>
      </div>
    </div>
  );
}
