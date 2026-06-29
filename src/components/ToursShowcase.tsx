"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

interface ToursShowcaseProps {
  onBook: (item: { 
    type: string; 
    name: string; 
    price: number; 
    payload?: { slug: string } 
  }) => void;
}

export default function ToursShowcase({ onBook }: ToursShowcaseProps) {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);
  const [packages, setPackages] = useState<any[]>([]);
  
  // Loading states
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);

  // Mock fallbacks to guarantee robust UI delivery in any environment
  const mockTours = [
    {
      title: 'Zanzibar Exotic Beach Experience',
      slug: 'zanzibar-beach-exotic',
      location: '📍 Zanzibar, Tanzania',
      duration: '🗓️ 6 Days, 5 Nights',
      price: 850000,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      description: 'Indulge in a private beachfront villa resort. Includes complete blue safari cruises, historic stone town tours, and flight connections.'
    },
    {
      title: 'Luxury Dubai Classic Escapes',
      slug: 'luxury-dubai-escapes',
      location: '📍 Dubai, UAE',
      duration: '🗓️ 5 Days, 4 Nights',
      price: 920000,
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
      description: 'Premium reservations in downtown Dubai. Experience dune sunset safaris, Burj Khalifa entries, and personalized tour schedules.'
    },
    {
      title: 'Seychelles Romantic Luxury Escape',
      slug: 'seychelles-luxury-escape',
      location: '📍 Praslin, Seychelles',
      duration: '🗓️ 7 Days, 6 Nights',
      price: 1350000,
      image: 'https://images.unsplash.com/photo-1473116763269-255ea7604bb6?auto=format&fit=crop&w=600&q=80',
      description: 'Pure paradise with tropical garden views and lagoon entries. Includes return flight options, daily premium buffet, and ocean safaris.'
    }
  ];

  // Fetch all destinations on mount
  useEffect(() => {
    const fetchDestinations = async () => {
      setLoadingDestinations(true);
      try {
        const data = await apiFetch<any>('/api/packages/destinations/');
        const list = Array.isArray(data) ? data : (data.results || []);
        setDestinations(list);
      } catch (error) {
        console.warn("Could not fetch destinations from API, using default mock packages layout:", error);
        setDestinations([]);
      } finally {
        setLoadingDestinations(false);
      }
    };
    fetchDestinations();
  }, []);

  // Fetch packages when a destination is selected
  const handleSelectDestination = async (destination: any) => {
    setSelectedDestination(destination);
    setLoadingPackages(true);
    try {
      const data = await apiFetch<any>(`/api/packages/destinations/${destination.slug}/`);
      // Endpoint returns the destination details plus its packages
      const list = data?.packages || [];
      setPackages(list);
    } catch (error) {
      console.warn("Could not load packages for destination from API. Using fallback mock.", error);
      // Fallback
      setPackages(mockTours.filter(t => t.location.toLowerCase().includes(destination.slug.toLowerCase()) || destination.slug === 'zanzibar'));
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleBackToDestinations = () => {
    setSelectedDestination(null);
    setPackages([]);
  };

  const showDestinationsGrid = destinations.length > 0 && !selectedDestination;

  return (
    <section className="bg-white py-20 px-4 sm:px-8 border-t border-purple-50/80 text-left">
      <div className="max-w-7xl mx-auto">
        
        {/* Header copy */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-brand-orange text-xs font-black uppercase tracking-widest block mb-2">Alphaa Curated Holiday tours</span>
          <h2 className="text-2xl sm:text-4xl font-black text-brand-purple tracking-tight uppercase font-sans">
            {selectedDestination ? `${selectedDestination.name} Holiday Offers` : "Breathtaking Getaways"}
          </h2>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed font-semibold">
            Secure hand-crafted safari packages and coastal retreats with vetted transport logistics, boutique resort lodging, and direct premium air connections.
          </p>
        </div>

        {/* Dynamic Destinations Grid View */}
        {showDestinationsGrid && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest) => (
              <div 
                key={dest.slug} 
                onClick={() => handleSelectDestination(dest)}
                className="bg-white rounded-3xl overflow-hidden border border-purple-100 flex flex-col group hover:border-brand-orange hover:shadow-xl transition-all duration-500 cursor-pointer"
              >
                <div className="h-64 overflow-hidden relative">
                  <img src={dest.main_image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#4C1D5C]/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-[10px] uppercase font-bold text-brand-orange block">{dest.country}</span>
                    <h3 className="text-lg font-black">{dest.name}</h3>
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between border-t border-purple-50">
                  <span className="text-xs font-bold text-slate-500">{dest.package_count} Packages Available</span>
                  <span className="text-xs font-black text-brand-purple">From ₦{Number(dest.starting_price).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Destination's Packages View */}
        {selectedDestination && (
          <div>
            <button
              onClick={handleBackToDestinations}
              className="mb-8 text-xs font-bold text-brand-purple hover:text-brand-orange flex items-center gap-1 cursor-pointer border-none bg-transparent"
            >
              ← Back to Destinations list
            </button>

            {loadingPackages ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {packages.length === 0 ? (
                  <p className="col-span-3 text-center text-slate-400 font-bold py-12">No active safari packages currently listed for this destination.</p>
                ) : (
                  packages.map((pack) => (
                    <div key={pack.slug} className="bg-white rounded-3xl overflow-hidden border border-purple-100 flex flex-col group hover:border-brand-orange hover:shadow-2xl transition-all duration-500">
                      <div className="h-64 overflow-hidden relative">
                        <img src={pack.main_image} alt={pack.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#4C1D5C] to-transparent opacity-60"></div>
                        <span className="absolute bottom-4 left-4 bg-white/95 text-brand-purple text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-wider">
                          🗓️ {pack.duration_days} Days, {pack.duration_nights} Nights
                        </span>
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-extrabold text-brand-purple leading-snug">{pack.title}</h3>
                          <p className="text-xs text-slate-500 mt-2 leading-relaxed font-semibold">
                            {pack.summary || pack.description}
                          </p>
                        </div>
                        <div className="border-t border-purple-50 mt-6 pt-4 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-slate-400 block uppercase font-bold">Total price from</span>
                            <strong className="text-lg font-black text-brand-orange">₦{Number(pack.price).toLocaleString()}</strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => onBook({
                              type: 'package',
                              name: pack.title,
                              price: Number(pack.price),
                              payload: { slug: pack.slug }
                            })}
                            className="bg-brand-purple hover:bg-brand-orange text-white font-extrabold px-4.5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer border-none"
                          >
                            Book Trip
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Fallback View: Mock tours shown if destinations API was empty */}
        {destinations.length === 0 && !loadingDestinations && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockTours.map((tour, idx) => (
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
                      onClick={() => onBook({ 
                        type: 'package', 
                        name: tour.title, 
                        price: tour.price,
                        payload: { slug: tour.slug }
                      })}
                      className="bg-brand-purple hover:bg-brand-orange text-white font-extrabold px-4.5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer border-none"
                    >
                      Book Trip
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
