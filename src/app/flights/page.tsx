"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SearchWidget from '@/components/SearchWidget';
import Listings from '@/components/Listings';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import CheckoutModal from '@/components/CheckoutModal';
import BillingModal from '@/components/BillingModal';
import BoardingPass from '@/components/BoardingPass';

function FlightsQueryPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search parameters from URL
  const originParam = searchParams.get('origin') || 'LOS';
  const destinationParam = searchParams.get('destination') || 'ABV';
  const dateParam = searchParams.get('date') || '2026-07-20';
  const cabinParam = searchParams.get('cabin') || 'Economy';

  // Local Search state
  const [searchQuery, setSearchQuery] = useState({
    origin: originParam,
    destination: destinationParam,
    date: dateParam,
    cabin: cabinParam,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Checkout and billing states
  const [selectedProduct, setSelectedProduct] = useState<{ 
    type: string; 
    name: string; 
    price: number;
    payload?: any;
  } | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [bookingResponse, setBookingResponse] = useState<any | null>(null);

  const [passengerInfo, setPassengerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [confirmedTicket, setConfirmedTicket] = useState<{
    passenger: string;
    cabin: string;
    hash: string;
    pnr: string;
    details: {
      carrier?: string;
      name?: string;
      number?: string;
    };
    type: string;
  } | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 5000);
  };

  // Sync state with URL search params when they change
  useEffect(() => {
    setSearchQuery({
      origin: originParam,
      destination: destinationParam,
      date: dateParam,
      cabin: cabinParam,
    });
  }, [originParam, destinationParam, dateParam, cabinParam]);

  // Smooth scroll search results into view
  useEffect(() => {
    if (!isLoading) {
      const hasQuery = searchParams.has('origin') || searchParams.has('destination') || searchParams.has('date');
      if (hasQuery) {
        const timer = setTimeout(() => {
          const el = document.getElementById('listings-viewports');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, searchParams]);

  const handleSearchSubmit = (params: {
    tab: string;
    origin: string;
    destination: string;
    date: string;
    checkoutDate?: string;
    cabin: string;
  }) => {
    if (params.tab === 'tours' || params.tab === 'packages') {
      router.push('/packages');
      return;
    }
    if (params.tab === 'hotels') {
      router.push(`/hotels?destination=${encodeURIComponent(params.origin)}&check_in=${params.date}&check_out=${params.checkoutDate || ''}&guests=${params.destination}&stars=${params.cabin}`);
      return;
    }

    setIsLoading(true);
    triggerToast("Searching active airline reservation systems...");
    
    // Update the URL parameters
    const query = new URLSearchParams();
    query.set('origin', params.origin);
    query.set('destination', params.destination);
    query.set('date', params.date);
    query.set('cabin', params.cabin);

    router.push(`/flights?${query.toString()}`);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000); // reset loader state
  };

  const handleSwitchTab = (tabId: string) => {
    if (tabId === 'flights') {
      router.push('/flights');
    } else if (tabId === 'hotels') {
      router.push('/hotels');
    } else if (tabId === 'tours' || tabId === 'packages') {
      router.push('/packages');
    } else {
      router.push(`/?tab=${tabId}`);
    }
  };

  const handleBookFlight = (product: { type: string; name: string; price: number; payload?: any }) => {
    setSelectedProduct(product);
    setIsCheckoutOpen(true);
    triggerToast(`Booking initialized for ${product.name}`);
  };

  const handleProceedToBilling = (
    info: { firstName: string; lastName: string; email: string; phone: string },
    response?: any
  ) => {
    setPassengerInfo(info);
    setIsCheckoutOpen(false);
    if (response) {
      setBookingResponse(response);
    }
    setIsBillingOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsBillingOpen(false);
    
    const mockPnrCode = `PNR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const mockSecHash = `#TK-${Math.floor(100000 + Math.random() * 900000)}`;

    setConfirmedTicket({
      passenger: `${passengerInfo.firstName} ${passengerInfo.lastName}`,
      cabin: `${searchQuery.cabin} Class`,
      hash: mockSecHash,
      pnr: mockPnrCode,
      details: {
        carrier: selectedProduct?.name,
        name: selectedProduct?.name,
        number: 'P4-LOS90',
      },
      type: 'flight',
    });

    triggerToast("Automated E-Ticket successfully delivered!");
  };

  const handleResetNavigation = () => {
    setConfirmedTicket(null);
    setBookingResponse(null);
    router.push('/');
  };

  return (
    <div className="bg-[#FAF8F5] text-slate-800 antialiased min-h-screen flex flex-col justify-between selection:bg-[#FA6432] selection:text-white">
      <Navbar
        onSwitchTab={(tabId) => router.push(`/?tab=${tabId}`)}
        onReset={() => router.push('/')}
        activeTab="flights"
      />

      <main className="flex-grow">
        
        {confirmedTicket ? (
          <div className="py-12">
            <BoardingPass
              confirmedTicket={confirmedTicket}
              onReset={handleResetNavigation}
              origin={searchQuery.origin}
              destination={searchQuery.destination}
            />
          </div>
        ) : (
          <>
            {/* Banner Section */}
            <div className="bg-gradient-to-br from-[#4C1D5C] to-[#2E1238] text-white pt-16 pb-28 px-4 text-center">
              <h1 className="text-3xl sm:text-4xl font-black font-sans uppercase tracking-tight">
                Flight Search Results
              </h1>
              <p className="text-sm text-purple-100 mt-2 font-semibold">
                Compare flight schedules and cabin deals matching your preference
              </p>
            </div>

            {/* Floating Search Widget */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-16 relative z-10">
              <SearchWidget
                activeTab="flights"
                onSwitchTab={handleSwitchTab}
                onSearch={handleSearchSubmit}
              />
            </div>

            {/* Listings Section */}
            <div className="mt-8">
              <Listings
                activeTab="flights"
                isVisible={true}
                isLoading={isLoading}
                onReset={() => router.push('/')}
                onBook={handleBookFlight}
                origin={searchQuery.origin}
                destination={searchQuery.destination}
                checkInDate={searchQuery.date}
                guests="1"
                stars={searchQuery.cabin}
              />
            </div>
          </>
        )}

      </main>

      <Footer onSwitchTab={() => {}} triggerToast={triggerToast} />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        selectedProduct={selectedProduct}
        onDismiss={() => setIsCheckoutOpen(false)}
        onProceed={handleProceedToBilling}
      />

      <BillingModal
        isOpen={isBillingOpen}
        passengerEmail={passengerInfo.email}
        totalCost={selectedProduct?.price || 0}
        bookingResponse={bookingResponse}
        onSuccess={handlePaymentSuccess}
        onDismiss={() => setIsBillingOpen(false)}
        triggerToast={triggerToast}
      />

      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}

export default function FlightsQueryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    }>
      <FlightsQueryPageContent />
    </Suspense>
  );
}
