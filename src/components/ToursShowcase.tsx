"use client";

import React from 'react';

interface ToursShowcaseProps {
  onBook: (item: { type: string; name: string; price: number }) => void;
}

export default function ToursShowcase({ onBook }: ToursShowcaseProps) {
  const tours = [
    {
      title: 'Zanzibar Exotic Beach Experience',
      location: '📍 Zanzibar, Tanzania',
      duration: '🗓️ 6 Days, 5 Nights',
      price: 850000,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      description: 'Indulge in a private beachfront villa resort. Includes complete blue safari cruises, historic stone town tours, and flight connections.'
    },
    {
      title: 'Luxury Dubai Classic Escapes',
      location: '📍 Dubai, UAE',
      duration: '🗓️ 5 Days, 4 Nights',
      price: 920000,
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
      description: 'Premium reservations in downtown Dubai. Experience dune sunset safaris, Burj Khalifa entries, and personalized tour schedules.'
    },
    {
      title: 'Seychelles Romantic Luxury Escape',
      location: '📍 Praslin, Seychelles',
      duration: '🗓️ 7 Days, 6 Nights',
      price: 1350000,
      image: 'https://images.unsplash.com/photo-1473116763269-255ea7604bb6?auto=format&fit=crop&w=600&q=80',
      description: 'Pure paradise with tropical garden views and lagoon entries. Includes return flight options, daily premium buffet, and ocean safaris.'
    }
  ];

  return (
    <section className="bg-white py-20 px-4 sm:px-8 border-t border-purple-50/80 text-left">
      <div className="max-w-7xl mx-auto">
        
        {/* Copy Details */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-brand-orange text-xs font-black uppercase tracking-widest block mb-2">Alphaa Curated Holiday tours</span>
          <h2 className="text-2xl sm:text-4xl font-black text-brand-purple tracking-tight uppercase font-sans">Breathtaking African Getaways</h2>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed font-semibold">
            Secure hand-crafted safari packages and coastal retreats with vetted transport logistics, boutique resort lodging, and direct premium air connections.
          </p>
        </div>

        {/* Tours Cards layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tours.map((tour, idx) => (
            <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-purple-100 flex flex-col group hover:border-brand-orange hover:shadow-2xl hover:shadow-[#4C1D5C]/5 transition-all duration-500">
              <div className="h-64 overflow-hidden relative">
                <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#4C1D5C] to-transparent opacity-60"></div>
                <span className="absolute bottom-4 left-4 bg-white/95 text-brand-purple text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-wider">
                  {tour.duration}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-brand-orange uppercase font-bold block mb-1">{tour.location}</span>
                  <h3 className="text-lg font-extrabold text-brand-purple leading-snug">{tour.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed font-semibold">
                    {tour.description}
                  </p>
                </div>
                <div className="border-t border-purple-50 mt-6 pt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Total price from</span>
                    <strong className="text-lg font-black text-brand-orange">₦{tour.price.toLocaleString()}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => onBook({ type: 'holiday safari', name: tour.title, price: tour.price })}
                    className="bg-brand-purple hover:bg-brand-orange text-white font-extrabold px-4.5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Book Trip
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
