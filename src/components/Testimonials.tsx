"use client";

import React, { useState, useEffect, useRef } from 'react';

interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  time: string;
  rating: number;
  text: string;
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      id: "1",
      name: "Karan",
      avatar: "/reviewer_karan.png",
      time: "1 week ago",
      rating: 5,
      text: "My booking experience for our Kenya safari was outstanding. Every flight connection, lodging confirmation, and local transit detail was handled with care and extreme professionalism. Excellent customer support!"
    },
    {
      id: "2",
      name: "Catherine",
      avatar: "/reviewer_catherine.png",
      time: "10 days ago",
      rating: 5,
      text: "I love the ease of booking flights and hotels here. The visa assistance team responded in a timely manner with clear checklists. Everything was resolved smoothly without any cancellation issues."
    },
    {
      id: "3",
      name: "Peter",
      avatar: "/reviewer_peter.png",
      time: "2 weeks ago",
      rating: 5,
      text: "Visited their Lagos office to align on our group safari. The travel advisors were very experienced, showed us all flight routings, and accommodated our schedule perfectly. Extremely satisfied with the service."
    }
  ];

  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  const handleScroll = () => {
    const container = carouselRef.current;
    if (!container) return;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    if (maxScrollLeft <= 0) {
      setScrollPercentage(0);
      return;
    }
    const percentage = (container.scrollLeft / maxScrollLeft) * 100;
    setScrollPercentage(percentage);
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = carouselRef.current;
    if (!container) return;
    const cardWidth = 340 + 24; // card width + gap
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="py-20 px-4 sm:px-8 bg-white border-t border-slate-100 text-left">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Trustpilot Integration Header */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading text-brand-purple">
            Read reviews, <br className="sm:hidden" />ride with confidence.
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm sm:text-base text-slate-600 font-medium">
            <span className="font-extrabold text-slate-800">4.2/5</span>
            {/* Trustpilot Style Green Star SVG */}
            <svg className="w-5 h-5 text-brand-orange" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              <path d="M9 11l2 2 4-4" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-black text-brand-orange tracking-tight font-sans text-base">Trustpilot</span>
            <span className="text-slate-400 font-normal">Based on 5210 reviews</span>
          </div>
        </div>

        {/* Carousel Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left Navigation and Heading Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Decorative Quote Mark */}
            <svg className="w-12 h-12 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.154c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-purple tracking-tight leading-tight font-heading">
              What our<br />customers are<br />saying
            </h3>

            {/* Indicator controls */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full border border-slate-300 hover:border-brand-orange hover:text-brand-orange text-slate-500 transition-all flex items-center justify-center cursor-pointer font-bold"
                aria-label="Scroll left"
              >
                ←
              </button>

              {/* Dynamic Progress Line */}
              <div className="h-[2px] bg-slate-200 w-24 relative overflow-hidden rounded-full">
                <div
                  className="absolute inset-y-0 left-0 bg-brand-orange transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${scrollPercentage}%` }}
                />
              </div>

              <button
                type="button"
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border border-slate-300 hover:border-brand-orange hover:text-brand-orange text-slate-500 transition-all flex items-center justify-center cursor-pointer font-bold"
                aria-label="Scroll right"
              >
                →
              </button>
            </div>
          </div>

          {/* Right Carousel Track Column */}
          <div className="lg:col-span-9 relative">
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 select-none [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {testimonials.map((test) => (
                <div
                  key={test.id}
                  className="flex-shrink-0 w-[290px] sm:w-[340px] snap-start flex flex-col justify-between"
                >
                  {/* Chat Speech Bubble */}
                  <div className="bg-[#FAF8F5] p-6 rounded-3xl shadow-sm border border-slate-100/50 relative mb-5 flex-1 flex flex-col justify-between min-h-[180px]">
                    <p className="text-slate-600 text-sm leading-relaxed font-semibold italic">
                      "{test.text}"
                    </p>

                    {/* Stars and Bottom Tail */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex gap-0.5 text-brand-orange">
                        {[...Array(test.rating)].map((_, i) => (
                          <span key={i} className="text-sm">★</span>
                        ))}
                      </div>
                    </div>

                    {/* Chat Bubble Tail SVG */}
                    <svg className="absolute bottom-[-8px] left-8 w-6 h-2.5 text-[#FAF8F5] fill-current" viewBox="0 0 20 10" preserveAspectRatio="none">
                      <polygon points="0,0 10,10 20,0" />
                    </svg>
                  </div>

                  {/* Reviewer Details */}
                  <div className="flex items-center gap-3 pl-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm shrink-0">
                      <img src={test.avatar} alt={test.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-brand-purple leading-tight">{test.name}</h4>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{test.time}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
