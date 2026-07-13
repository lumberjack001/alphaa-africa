"use client";

import React from 'react';

interface Partner {
  name: string;
  logo: React.ReactNode;
}

export default function Partners() {
  const partners: Partner[] = [
    {
      name: "Civil Aviation Authority",
      logo: (
        <svg className="h-7 w-auto" viewBox="0 0 220 50" fill="currentColor">
          <g transform="translate(5, 5)">
            <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M5 20 L35 20 M20 5 L20 35" stroke="currentColor" strokeWidth="1" />
            <path d="M8 10 C14 14 14 26 8 30 M32 10 C26 14 26 26 32 30" fill="none" stroke="currentColor" strokeWidth="1" />
          </g>
          <text x="50" y="24" fontSize="13" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">CIVIL AVIATION</text>
          <text x="50" y="38" fontSize="10" fontWeight="600" fontFamily="sans-serif" letterSpacing="0.5" opacity="0.8">AUTHORITY</text>
        </svg>
      )
    },
    {
      name: "SafeKey",
      logo: (
        <svg className="h-7 w-auto" viewBox="0 0 130 50" fill="currentColor">
          <g transform="translate(5, 8)">
            <rect x="2" y="12" width="20" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M7 12 V7 a5 5 0 0 1 10 0 v5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="20" r="1.5" fill="currentColor" />
          </g>
          <text x="35" y="24" fontSize="9" fontWeight="normal" fontFamily="sans-serif" letterSpacing="1.5" opacity="0.6">AMERICAN EXPRESS</text>
          <text x="35" y="38" fontSize="14" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">SafeKey</text>
        </svg>
      )
    },
    {
      name: "Verified by Visa",
      logo: (
        <svg className="h-7 w-auto" viewBox="0 0 150 50" fill="currentColor">
          <text x="5" y="18" fontSize="9" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5" opacity="0.7">Verified by</text>
          <text x="5" y="42" fontSize="24" fontWeight="900" fontFamily="sans-serif" fontStyle="italic" letterSpacing="-1">VISA</text>
          <g transform="translate(85, 12)" className="text-brand-orange">
            <path d="M12 2 L2 7 v7 c0 5.5 4.5 10 10 10 s10-4.5 10-10 V7 L12 2 z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M7 12 l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      )
    },
    {
      name: "Air Peace",
      logo: (
        <svg className="h-7 w-auto" viewBox="0 0 160 50" fill="currentColor">
          <g transform="translate(5, 8)">
            <path d="M2 20 C8 12 18 8 28 14 C22 18 15 18 10 22 C16 22 22 20 26 25 C18 27 10 27 2 20 Z" fill="currentColor" />
            <path d="M12 12 C18 4 26 6 28 14 C22 14 18 16 12 12 Z" fill="currentColor" opacity="0.8" />
          </g>
          <text x="40" y="28" fontSize="16" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">AIR PEACE</text>
          <text x="40" y="38" fontSize="8" fontWeight="bold" fontFamily="sans-serif" letterSpacing="2.5" opacity="0.7">YOUR PEACE, OUR GOAL</text>
        </svg>
      )
    },
    {
      name: "Air France",
      logo: (
        <svg className="h-7 w-auto" viewBox="0 0 160 50" fill="currentColor">
          <text x="5" y="32" fontSize="18" fontWeight="800" fontFamily="sans-serif" letterSpacing="1.5">AIRFRANCE</text>
          <path d="M125 12 L145 12 L133 36 L113 36 Z" className="fill-brand-orange" />
        </svg>
      )
    },
    {
      name: "Amadeus",
      logo: (
        <svg className="h-7 w-auto" viewBox="0 0 140 50" fill="currentColor">
          <g transform="translate(5, 10)">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </g>
          <text x="35" y="30" fontSize="18" fontWeight="700" fontFamily="sans-serif" letterSpacing="-0.5">amadeus</text>
        </svg>
      )
    },
    {
      name: "PCI DSS",
      logo: (
        <svg className="h-7 w-auto" viewBox="0 0 120 50" fill="currentColor">
          <g transform="translate(5, 8)">
            <path d="M12 2 L2 7 v9 c0 7 10 12 10 12 s10-5 10-12 V7 L12 2 z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M7 13 l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <text x="35" y="24" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">PCI DSS</text>
          <text x="35" y="36" fontSize="8" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5" opacity="0.7">COMPLIANT</text>
        </svg>
      )
    },
    {
      name: "Ethiopian Airlines",
      logo: (
        <svg className="h-7 w-auto" viewBox="0 0 170 50" fill="currentColor">
          <g transform="translate(5, 5)">
            <path d="M2 20 C10 18 18 10 26 4 C22 12 18 20 8 26 Z" fill="currentColor" />
            <path d="M8 14 C16 12 20 6 24 2 C20 8 16 12 8 14 Z" fill="currentColor" opacity="0.7" />
          </g>
          <text x="35" y="24" fontSize="14" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">Ethiopian</text>
          <text x="35" y="38" fontSize="11" fontWeight="600" fontFamily="sans-serif" letterSpacing="2" opacity="0.8">AIRLINES</text>
        </svg>
      )
    },
    {
      name: "IATA",
      logo: (
        <svg className="h-7 w-auto" viewBox="0 0 110 50" fill="currentColor">
          <g transform="translate(5, 5)">
            <ellipse cx="16" cy="16" rx="14" ry="12" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            <ellipse cx="16" cy="16" rx="8" ry="12" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            <line x1="2" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            <line x1="16" y1="4" x2="16" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          </g>
          <text x="28" y="28" fontSize="22" fontWeight="900" fontFamily="sans-serif" fontStyle="italic" letterSpacing="-0.5">IATA</text>
        </svg>
      )
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-8 bg-[#FAF8F5] overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Heading and Subheading */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading text-brand-purple">
            Trusted <span className="text-brand-orange italic font-normal font-sans">Partnerships</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base font-medium">
            We collaborate with the world's leading airlines and organizations.
          </p>
        </div>

        {/* Infinite Scroller Marquee */}
        <div className="relative w-full overflow-hidden py-4 select-none">
          {/* Gradient overlay fades on left and right */}
          <div className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#FAF8F5] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#FAF8F5] to-transparent z-10 pointer-events-none" />

          {/* Marquee inner flex track */}
          <div className="flex w-max flex-nowrap items-center">
            {/* Track 1 */}
            <div className="flex items-center gap-16 sm:gap-24 px-8 shrink-0 animate-infinite-scroll">
              {partners.map((partner, idx) => (
                <div
                  key={`track1-${idx}`}
                  className="flex items-center justify-center text-slate-400/80 hover:text-slate-600 transition-colors duration-300"
                  title={partner.name}
                >
                  {partner.logo}
                </div>
              ))}
            </div>

            {/* Track 2 (Identical loop track) */}
            <div className="flex items-center gap-16 sm:gap-24 px-8 shrink-0 animate-infinite-scroll" aria-hidden="true">
              {partners.map((partner, idx) => (
                <div
                  key={`track2-${idx}`}
                  className="flex items-center justify-center text-slate-400/80 hover:text-slate-600 transition-colors duration-300"
                  title={partner.name}
                >
                  {partner.logo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
