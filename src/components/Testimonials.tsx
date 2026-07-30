"use client";

import React, { useState, useEffect, useRef } from 'react';

interface Testimonial {
  id: string;
  title: string;
  text: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      id: "1",
      title: "A Truly Stress-Free Travel Experience",
      text: "From booking our flights to arranging our hotel and airport pickup, Alphaa Africa handled everything perfectly. Their team kept us informed every step of the way, making our trip completely stress-free. I highly recommend them to anyone looking for dependable travel services.",
      name: "Kyrian Obaigbena",
      location: "Abuja",
      avatar: "/customers/Kyrian.jpg.jpeg",
      rating: 5,
    },
    {
      id: "2",
      title: "Professional and Reliable",
      text: "I've used several travel agencies over the years, but Alphaa Africa stands out for their professionalism and prompt service. They found us the best flight options within our budget and assisted with every detail of our travel plans.",
      name: "Mary Ifeoluwa",
      location: "Lagos",
      avatar: "/customers/Mary Ifeoluwa.jpg.jpeg",
      rating: 5,
    },
    {
      id: "3",
      title: "Exceptional Customer Support",
      text: "What impressed me most was their responsiveness. Whenever I had a question about my visa application or travel itinerary, their team was available to help. Their customer service is exceptional.",
      name: "Esther Mouka",
      location: "Port Harcourt",
      avatar: "/customers/Esther.jpg.jpeg",
      rating: 5,
    },
    {
      id: "4",
      title: "Our Corporate Travel Partner",
      text: "Managing business travel for our executives used to be stressful until we partnered with Alphaa Africa. Their efficiency, attention to detail, and timely communication have made them our trusted travel management partner.",
      name: "Corporate Client",
      location: "Enterprise Partner",
      avatar: "/customers/Grace-Moni.png",
      rating: 5,
    },
    {
      id: "5",
      title: "Highly Recommended",
      text: "Our family vacation was planned flawlessly. From hotel reservations to airport transfers, everything went exactly as promised. Thank you, Alphaa Africa, for making our holiday memorable.",
      name: "Mr Michael Okpale & Family",
      location: "Verified Family Traveler",
      avatar: "/customers/Okpale.jpg.jpeg",
      rating: 5,
    },
  ];

  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const isPausedRef = useRef(false);

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

  const scroll = (direction: 'left' | 'right') => {
    const container = carouselRef.current;
    if (!container) return;
    const cardWidth = 340 + 24; // card width + gap
    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    if (direction === 'right') {
      if (container.scrollLeft + cardWidth >= maxScrollLeft - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    } else {
      if (container.scrollLeft <= 10) {
        container.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, []);

  // Autoplay Effect (scrolls every 4 seconds unless hovered/touched)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPausedRef.current) return;
      scroll('right');
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-4 sm:px-8 bg-white border-t border-slate-100 text-left">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Trustpilot Integration Header */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading text-brand-purple">
            Read reviews, <br className="sm:hidden" />ride with confidence.
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm sm:text-base text-slate-600 font-medium">
            <span className="font-extrabold text-slate-800">4.9/5</span>
            {/* Trustpilot Style Green Star SVG */}
            <svg className="w-5 h-5 text-brand-orange" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              <path d="M9 11l2 2 4-4" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-black text-brand-orange tracking-tight font-sans text-base">Trustpilot</span>
            <span className="text-slate-400 font-normal">Based on 5,210 verified reviews</span>
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
              onMouseEnter={() => { isPausedRef.current = true; }}
              onMouseLeave={() => { isPausedRef.current = false; }}
              onTouchStart={() => { isPausedRef.current = true; }}
              onTouchEnd={() => { isPausedRef.current = false; }}
              className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 select-none [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {testimonials.map((test) => (
                <div
                  key={test.id}
                  className="flex-shrink-0 w-[300px] sm:w-[360px] snap-start flex flex-col justify-between"
                >
                  {/* Chat Speech Bubble */}
                  <div className="bg-[#FAF8F5] p-6 rounded-3xl shadow-sm border border-slate-100/50 relative mb-5 flex-1 flex flex-col justify-between min-h-[220px]">
                    <div>
                      <h4 className="text-brand-purple font-black text-sm uppercase tracking-tight mb-2 font-sans">
                        {test.title}
                      </h4>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold italic">
                        "{test.text}"
                      </p>
                    </div>

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
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-purple-100 shadow-sm shrink-0 bg-slate-100">
                      <img src={test.avatar} alt={test.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-brand-purple leading-tight">{test.name}</h4>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{test.location}</span>
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
