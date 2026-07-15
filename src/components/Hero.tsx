"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import SearchWidget from './SearchWidget';

interface HeroProps {
  activeTab: string;
  onSwitchTab: (tabId: string) => void;
  onSearch: (searchParams: {
    tab: string;
    origin: string;
    destination: string;
    date: string;
    cabin: string;
  }) => void;
}

const DEFAULT_SLIDES = [
  {
    image: '/kilimanjaro_hero_bg.webp',
    label: 'Mount Kilimanjaro, Tanzania',
  },
  {
    image: '/zanzibar_beach.webp',
    label: 'Zanzibar Beaches, Tanzania',
  },
  {
    image: '/lagos_nigeria.webp',
    label: 'Lagos, Nigeria',
  },
  {
    image: '/abuja_aso_rock.webp',
    label: 'Abuja, Nigeria',
  },
  {
    image: '/cape_town.webp',
    label: 'Cape Town, South Africa',
  },
];

const SLIDE_DURATION = 5000; // ms per slide

// Format dynamic labels from file names (e.g. abuja_aso_rock.webp -> Abuja Aso Rock)
const formatLabel = (filePath: string) => {
  const baseName = filePath.split('/').pop() || '';
  const nameWithoutExt = baseName.replace(/\.[^/.]+$/, "");
  return nameWithoutExt
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function Hero({ activeTab, onSwitchTab, onSearch }: HeroProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<{ image: string; label: string }[]>(DEFAULT_SLIDES);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Fetch dynamic slide images on mount
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch('/api/hero-images');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map(item => ({
              image: item,
              label: formatLabel(item)
            }));
            setSlides(mapped);
          }
        }
      } catch (err) {
        console.error("Could not fetch dynamic hero images:", err);
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Only mount current slide + the next one (for a seamless pre-load).
  // All others are excluded from the DOM entirely to avoid parallel image fetches.
  const nextSlide = (currentSlide + 1) % slides.length;
  const mountedSlides = new Set([0, currentSlide, nextSlide]); // always keep slide 0 mounted (it's the LCP)

  return (
    <section
      className="relative z-0 bg-center bg-cover bg-no-repeat py-20 lg:py-28 px-4 sm:px-8 overflow-x-clip overflow-y-visible min-h-[90vh] flex flex-col justify-center animate-fadeIn"
    >
      {/* Carousel background layers - cross-fade */}
      {slides.map((slide, idx) => {
        if (!mountedSlides.has(idx)) return null;
        const isActive = idx === currentSlide;
        const isFirst = idx === 0;

        return (
          <div
            key={slide.image}
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none hero-slide-fade"
            style={{
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 1 : 0,
            }}
          >
            <Image
              src={slide.image}
              alt={slide.label}
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority={isFirst}
              quality={85}
            />
          </div>
        );
      })}

      {/* Rich dark purple overlay for premium contrast (images show through at 35% opacity) */}
      <div className="absolute inset-0 bg-brand-purple/65 z-10 pointer-events-none"></div>

      {/* Giant Triplio-style Background Text */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10vw] font-black text-white/5 uppercase tracking-[0.1em] pointer-events-none select-none z-10 transition-all duration-1000 ease-out ${isLoaded ? 'top-1/2 opacity-100' : 'top-[55%] opacity-0'
          }`}
      >
        ALPHAA
      </div>

      <div className="relative z-20 max-w-7xl mx-auto w-full flex flex-col justify-between h-full">

        {/* Content Row: Text Details */}
        <div className="text-left max-w-4xl mb-10 space-y-4">

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-5xl font-black text-white tracking-tight leading-tight uppercase font-sans">
            Travel Beyond <span className="text-brand-orange">Borders</span>
          </h1>

          {/* Subheadline */}
          <h2 className="text-lg sm:text-2xl font-bold text-white tracking-wide font-sans leading-snug">
            Seamless Flights. Curated Holidays. Trusted Travel Experts.
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-purple-100/90 max-w-3xl leading-relaxed font-semibold">
            From local trips to global journeys, Alphaa Africa Travels and Tours delivers the best travel deals with stress-free planning and expert support every step of the way.
          </p>

          {/* Badges/Trust Row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 text-xs font-semibold text-white">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span><span className="tracking-[0.1em]">1M+</span> travellers</span>
            </div>
            <span className="hidden sm:inline text-purple-400/50">•</span>

            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
              <span><span className="tracking-[0.1em]">24/7</span> support</span>
            </div>
            <span className="hidden sm:inline text-purple-400/50">•</span>

            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 11 2 2 4-4" />
              </svg>
              <span><span className="tracking-[0.1em]">IATA</span> certified</span>
            </div>
            <span className="hidden sm:inline text-purple-400/50">•</span>

            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" rx="2" x="2" y="5" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
              <span><span className="tracking-[0.1em]">Flexible</span> payment structures</span>
            </div>
          </div>

        </div>

        {/* Absolutely positioned Search Widget overlay for desktop screens. */}
        <div className="hidden lg:block absolute bottom-0 left-0 w-full translate-y-110 z-20 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <SearchWidget activeTab={activeTab} onSwitchTab={onSwitchTab} onSearch={onSearch} />
          </div>
        </div>

      </div>
    </section>
  );
}

