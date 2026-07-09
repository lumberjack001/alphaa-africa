"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../lib/api';
import { useScrollEntrance } from '@/hooks/useScrollEntrance';

interface ToursShowcaseProps {
  onBook: (item: {
    type: string;
    name: string;
    price: number;
    payload?: { slug: string }
  }) => void;
}

export default function ToursShowcase({ onBook }: ToursShowcaseProps) {
  const router = useRouter();
  const [sectionRef, isVisible] = useScrollEntrance();
  const [destinations, setDestinations] = useState<any[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);
  const [packages, setPackages] = useState<any[]>([]);

  // Loading states
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);

  // Carousel Refs & Autoplay State
  const carouselRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);

  // Autoplay Effect
  useEffect(() => {
    if (destinations.length === 0 || selectedDestination) return;

    const interval = setInterval(() => {
      if (isPausedRef.current) return;

      const container = carouselRef.current;
      if (!container) return;

      const cardWidth = 384; // approx card width + gap
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [destinations, selectedDestination]);

  const scrollLeft = () => {
    const container = carouselRef.current;
    if (!container) return;
    const cardWidth = 384;
    const maxScroll = container.scrollWidth - container.clientWidth;

    if (container.scrollLeft <= 10) {
      container.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = carouselRef.current;
    if (!container) return;
    const cardWidth = 384;
    const maxScroll = container.scrollWidth - container.clientWidth;

    if (container.scrollLeft >= maxScroll - 10) {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };



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
      console.error("Could not load packages for destination from API:", error);
      setPackages([]);
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

    <section
      ref={sectionRef}
      className={`bg-white py-20 px-4 sm:px-8 border-t border-purple-50/80 text-left transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
    >


      {/* Spacer to prevent absolute search widget from covering content */}
      <div className="h-32 sm:h-36 lg:h-60"></div>



      <div className="max-w-7xl mx-auto">

        {/* Selected Destination's Packages View Header */}
        {selectedDestination && (
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-brand-orange text-xs font-black uppercase tracking-widest block mb-2">Holiday tours</span>
            <h2 className="text-2xl sm:text-4xl font-black text-brand-purple tracking-tight uppercase font-sans">
              {selectedDestination.name} Holiday Offers
            </h2>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed font-semibold">
              Secure hand-crafted safari packages and coastal retreats with vetted transport logistics, boutique resort lodging, and direct premium air connections.
            </p>
          </div>
        )}

        {/* Dynamic Destinations Carousel View */}
        {showDestinationsGrid && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-center">

            {/* Left Column: Explore copy and button */}
            <div className="lg:col-span-1 space-y-6">
              <span className="text-brand-orange text-xs font-bold uppercase tracking-widest block ">
                Explore the World
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#4C1D5C] tracking-tight leading-tight font-heading">
                Breathtaking <br className="hidden lg:block" />Destinations
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold">
                From stunning beaches to majestic mountains, find your next adventure.
              </p>
              <button
                onClick={() => router.push('/packages')}
                className="border border-slate-300 hover:border-brand-orange hover:text-brand-orange text-[10px] font-black uppercase tracking-wider px-5 py-3.5 rounded-lg transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
              >
                <span>View All Destinations</span>
                <span>&rarr;</span>
              </button>
            </div>

            {/* Right Column: Carousel */}
            <div className="lg:col-span-3 relative">
              {/* Carousel Container */}
              <div
                ref={carouselRef}
                onMouseEnter={() => { isPausedRef.current = true; }}
                onMouseLeave={() => { isPausedRef.current = false; }}
                className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {destinations.map((dest) => (
                  <div
                    key={dest.slug}
                    onClick={() => handleSelectDestination(dest)}
                    className="flex-shrink-0 w-[260px] sm:w-[320px] h-[360px] sm:h-[400px] snap-start bg-slate-900 rounded-3xl overflow-hidden relative group shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer"
                  >
                    <img
                      src={dest.main_image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 absolute inset-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity duration-300"></div>

                    <div className="absolute bottom-6 left-6 text-white z-10 pr-6">
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                        {dest.name}, {dest.country}
                      </h3>
                      <span className="text-[11px] sm:text-xs font-semibold text-slate-300 block mt-1">
                        From ₦{Number(dest.starting_price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation controls below cards (centered) */}
              <div className="flex justify-center gap-4 mt-8">
                <button
                  type="button"
                  onClick={scrollLeft}
                  aria-label="Previous Destinations"
                  className="w-12 h-12 rounded-full border border-brand-orange bg-transparent text-brand-orange hover:bg-brand-orange hover:text-white flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={scrollRight}
                  aria-label="Next Destinations"
                  className="w-12 h-12 rounded-full border border-brand-orange bg-transparent text-brand-orange hover:bg-brand-orange hover:text-white flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                  </svg>
                </button>
              </div>
            </div>

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

        {/* Fallback View: message shown if destinations API was empty */}
        {destinations.length === 0 && !loadingDestinations && (
          <p className="text-center text-slate-400 font-bold py-12">No active destinations or holiday tours currently listed on the server.</p>
        )}

      </div>
    </section>
  );
}
