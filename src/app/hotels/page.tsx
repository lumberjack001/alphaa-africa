"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SearchWidget from '@/components/SearchWidget';
import Listings from '@/components/Listings';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';

export default function HotelsQueryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search parameters from URL
  const destinationParam = searchParams.get('destination') || 'Lagos';
  const checkInParam = searchParams.get('check_in') || '2026-07-20';
  const checkOutParam = searchParams.get('check_out') || '2026-07-27';
  const guestsParam = searchParams.get('guests') || '2 Guests';
  const starsParam = searchParams.get('stars') || '5 Stars';

  // Local Search state
  const [searchQuery, setSearchQuery] = useState({
    destination: destinationParam,
    checkIn: checkInParam,
    checkOut: checkOutParam,
    guests: guestsParam,
    stars: starsParam,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 5000);
  };

  // Sync state with URL search params when they change
  useEffect(() => {
    setSearchQuery({
      destination: destinationParam,
      checkIn: checkInParam,
      checkOut: checkOutParam,
      guests: guestsParam,
      stars: starsParam,
    });
  }, [destinationParam, checkInParam, checkOutParam, guestsParam, starsParam]);

  const handleSearchSubmit = (params: {
    tab: string;
    origin: string;
    destination: string;
    date: string;
    checkoutDate?: string;
    cabin: string;
  }) => {
    setIsLoading(true);
    triggerToast("Searching active travel database records...");
    
    // Update the URL parameters
    const query = new URLSearchParams();
    query.set('destination', params.origin);
    query.set('check_in', params.date);
    if (params.checkoutDate) query.set('check_out', params.checkoutDate);
    query.set('guests', params.destination);
    query.set('stars', params.cabin);

    router.push(`/hotels?${query.toString()}`);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000); // reset loader state
  };

  const handleHotelClick = (slug: string) => {
    const query = new URLSearchParams();
    query.set('check_in', searchQuery.checkIn);
    query.set('check_out', searchQuery.checkOut);
    query.set('guests', searchQuery.guests);
    query.set('stars', searchQuery.stars);
    router.push(`/hotels/${slug}?${query.toString()}`);
  };

  return (
    <div className="bg-[#FAF8F5] text-slate-800 antialiased min-h-screen flex flex-col justify-between selection:bg-[#FA6432] selection:text-white">
      <Navbar
        onSwitchTab={(tabId) => (window.location.href = `/#booking-engine`)}
        onReset={() => router.push('/')}
        activeTab="hotels"
      />

      <main className="flex-grow">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-br from-[#4C1D5C] to-[#2E1238] text-white pt-16 pb-28 px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-black font-sans uppercase tracking-tight">
            Hotel Search Results
          </h1>
          <p className="text-sm text-purple-100 mt-2 font-semibold">
            Browse premium verified accommodations matching your request
          </p>
        </div>

        {/* Floating Search Widget */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-16 relative z-10">
          <SearchWidget
            activeTab="hotels"
            onSwitchTab={() => {}}
            onSearch={handleSearchSubmit}
          />
        </div>

        {/* Listings Result matching destination */}
        <div className="mt-8">
          <Listings
            activeTab="hotels"
            isVisible={true}
            isLoading={isLoading}
            onReset={() => router.push('/')}
            onBook={() => {}}
            origin={searchQuery.destination}
            destination={searchQuery.guests}
            checkInDate={searchQuery.checkIn}
            checkOutDate={searchQuery.checkOut}
            guests={searchQuery.guests}
            stars={searchQuery.stars}
            onHotelClick={handleHotelClick}
          />
        </div>

      </main>

      <Footer onSwitchTab={() => {}} triggerToast={triggerToast} />
      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}
