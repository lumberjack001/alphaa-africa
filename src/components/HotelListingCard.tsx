"use client";

import React from 'react';
import { type HotelCard } from '@/services/hotelService';

interface HotelListingCardProps {
  hotel: HotelCard;
  fetchingDetails: boolean;
  onSelect: (hotel: HotelCard) => void;
  hasClickRouter?: boolean;
}

export default function HotelListingCard({
  hotel,
  fetchingDetails,
  onSelect,
  hasClickRouter = false
}: HotelListingCardProps) {
  return (
    <div
      className="bg-white hover:bg-[#F6EFF7]/10 transition-all rounded-3xl p-6 border border-purple-100/60 flex flex-col md:flex-row items-center justify-between gap-6"
    >
      <div className="flex items-center space-x-4 self-start md:self-center">
        <img
          src={hotel.main_image}
          alt={hotel.name}
          className="w-20 h-20 rounded-2xl object-cover border border-purple-100"
        />
        <div>
          <span className="text-[9px] text-brand-orange uppercase font-bold block">
            📍 {hotel.city}, {hotel.country}
          </span>
          <h4 className="text-base font-extrabold text-brand-purple leading-tight">{hotel.name}</h4>
          <span className="text-[10px] text-slate-400 block mt-1">
            {hotel.star_rating} Stars Rating • Option Verified
          </span>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {hotel.amenities_list?.slice(0, 3).map((amenity, idx) => (
              <span key={idx} className="bg-purple-50 text-[8px] text-brand-purple px-2 py-0.5 rounded-md font-bold">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-purple-50">
        <div className="text-left md:text-right">
          <span className="text-[9px] text-slate-400 block">Starting from</span>
          <strong className="text-xl sm:text-2xl font-black text-brand-purple block">
            ₦{Number(hotel.starting_price || 0).toLocaleString()}
          </strong>
        </div>
        <button
          type="button"
          onClick={() => onSelect(hotel)}
          disabled={fetchingDetails}
          className="bg-brand-orange hover:bg-brand-purple text-white font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer border-none flex items-center justify-center min-w-36 disabled:opacity-50"
        >
          {fetchingDetails ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            hasClickRouter ? "Check Availability" : "Reserve Hotel"
          )}
        </button>
      </div>
    </div>
  );
}
