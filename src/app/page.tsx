"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Listings from '@/components/Listings';
import ToursShowcase from '@/components/ToursShowcase';
import SecurityStatement from '@/components/SecurityStatement';
import CheckoutModal from '@/components/CheckoutModal';
import BillingModal from '@/components/BillingModal';
import BoardingPass from '@/components/BoardingPass';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';

function HomeContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || 'flights';
  });

  // Keep activeTab state in sync when URL search params change
  const tabParam = searchParams.get('tab');
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  // Search state
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [localSearchParams, setLocalSearchParams] = useState<{
    origin: string;
    destination: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    stars?: string;
    hours?: number;
  }>({
    origin: 'LOS',
    destination: 'ABV',
  });

  // Modal / Checkout flow state
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

  // Boarding Pass state
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

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 5000);
  };

  const handleSwitchTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsSearchVisible(false);
    triggerToast(`Switched search module: ${tabId.toUpperCase()}`);
  };

  const handleSearch = (params: {
    tab: string;
    origin: string;
    destination: string;
    date: string;
    checkoutDate?: string;
    cabin: string;
    hours?: number;
  }) => {
    if (params.tab === 'hotels') {
      window.location.href = `/hotels?destination=${encodeURIComponent(params.origin)}&check_in=${params.date}&check_out=${params.checkoutDate || ''}&guests=${params.destination}&stars=${params.cabin}`;
      return;
    }
    if (params.tab === 'flights') {
      window.location.href = `/flights?origin=${encodeURIComponent(params.origin)}&destination=${encodeURIComponent(params.destination)}&date=${params.date}&cabin=${encodeURIComponent(params.cabin)}`;
      return;
    }
    if (params.tab === 'tours') {
      window.location.href = '/packages';
      return;
    }
    if (params.tab === 'cars') {
      window.location.href = `/cars?vehicle_type=${encodeURIComponent(params.cabin)}&hours=${params.hours || ''}&date=${params.date || ''}&pickup=${encodeURIComponent(params.origin)}&dropoff=${encodeURIComponent(params.destination)}`;
      return;
    }
    setLocalSearchParams({
      origin: params.origin,
      destination: params.destination,
      checkIn: params.date,
      checkOut: params.checkoutDate,
      guests: params.destination,
      stars: params.cabin,
      hours: params.hours,
    });
    setIsSearchVisible(true);
    setIsSearchLoading(true);
    triggerToast("Reaching Sabre & Amadeus API databases...");

    // Smooth scroll to listings
    setTimeout(() => {
      const el = document.getElementById('listings-viewports');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    setTimeout(() => {
      setIsSearchLoading(false);
      triggerToast("GDS response matching parameters successfully generated.");
    }, 1000);
  };

  const handleResetSearch = () => {
    setIsSearchVisible(false);
    const el = document.getElementById('booking-engine');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToWidget = () => {
    const el = document.getElementById('booking-engine');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleResetNavigation = () => {
    setConfirmedTicket(null);
    setBookingResponse(null);
    setIsSearchVisible(false);
    const el = document.getElementById('booking-engine');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    triggerToast("Booking portal navigation reset.");
  };

  const handleBookProduct = (product: { type: string; name: string; price: number; payload?: any }) => {
    setSelectedProduct(product);
    setIsCheckoutOpen(true);
    triggerToast(`Checkout details registered for ${product.name}`);
  };

  const handleProceedToBilling = (
    info: { firstName: string; lastName: string; email: string; phone: string },
    response?: any,
    isEnquiry?: boolean
  ) => {
    setPassengerInfo(info);
    setIsCheckoutOpen(false);

    if (isEnquiry) {
      // Direct success screen for Package/Tour enquiries
      const mockPnrCode = `ENQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const mockSecHash = `#ENQ-${Math.floor(100000 + Math.random() * 900000)}`;

      setConfirmedTicket({
        passenger: `${info.firstName} ${info.lastName}`,
        cabin: 'Curated Holiday Enquiry',
        hash: mockSecHash,
        pnr: mockPnrCode,
        details: {
          name: selectedProduct?.name,
          carrier: selectedProduct?.name,
        },
        type: 'package'
      });

      triggerToast("Enquiry submitted! Our safari advisors will follow up by email.");

      // Smooth scroll to Boarding Pass/Receipt page
      setTimeout(() => {
        const el = document.getElementById('boarding-pass-eticket-viewport');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } else {
      // Hotel or flights booking -> Proceed to payment simulation
      if (response) {
        setBookingResponse(response);
      }
      setIsBillingOpen(true);
    }
  };

  const handlePaymentSuccess = (verifiedBooking?: any) => {
    setIsBillingOpen(false);

    if (verifiedBooking) {
      // Verified live booking confirmation
      setConfirmedTicket({
        passenger: verifiedBooking.guest_name,
        cabin: 'Hotel Lodging reservation',
        hash: `#TX-${verifiedBooking.reference}`,
        pnr: verifiedBooking.reference,
        details: {
          name: selectedProduct?.name,
          carrier: selectedProduct?.name,
        },
        type: 'hotel',
      });
    } else {
      // Generate simulated PNR and Security Hash for flight fallback
      const mockPnrCode = `PNR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const mockSecHash = `#TK-${Math.floor(100000 + Math.random() * 900000)}`;
      const chosenCabin = activeTab === 'flights' ? 'Economy Class' : 'Premium Cabin';

      setConfirmedTicket({
        passenger: `${passengerInfo.firstName} ${passengerInfo.lastName}`,
        cabin: chosenCabin,
        hash: mockSecHash,
        pnr: mockPnrCode,
        details: {
          carrier: selectedProduct?.name,
          name: selectedProduct?.name,
          number: activeTab === 'flights' ? 'P4-LOS90' : undefined,
        },
        type: selectedProduct?.type || 'flight',
      });
    }

    triggerToast("Automated E-Ticket successfully delivered!");

    // Smooth scroll to Boarding Pass
    setTimeout(() => {
      const el = document.getElementById('boarding-pass-eticket-viewport');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="bg-[#FAF8F5] text-slate-800 antialiased min-h-screen flex flex-col justify-between selection:bg-[#FA6432] selection:text-white">
      
      <Navbar
        onSwitchTab={handleSwitchTab}
        onReset={handleResetNavigation}
        onScrollToWidget={handleScrollToWidget}
        activeTab={activeTab}
      />

      <main className="flex-grow">
        
        {/* Render Boarding Pass success page or Hero Booking portal */}
        {confirmedTicket ? (
          <BoardingPass
            confirmedTicket={confirmedTicket}
            onReset={handleResetNavigation}
            origin={localSearchParams.origin}
            destination={localSearchParams.destination}
          />
        ) : (
          <>
            <Hero
              activeTab={activeTab}
              onSwitchTab={handleSwitchTab}
              onSearch={handleSearch}
            />

             <Listings
              activeTab={activeTab}
              isVisible={isSearchVisible}
              isLoading={isSearchLoading}
              onReset={handleResetSearch}
              onBook={handleBookProduct}
              origin={localSearchParams.origin}
              destination={localSearchParams.destination}
              checkInDate={localSearchParams.checkIn}
              checkOutDate={localSearchParams.checkOut}
              guests={localSearchParams.guests}
              stars={localSearchParams.stars}
              hours={localSearchParams.hours}
            />

            <ToursShowcase onBook={handleBookProduct} />

            <SecurityStatement />
          </>
        )}

      </main>

      <Footer onSwitchTab={handleSwitchTab} triggerToast={triggerToast} />

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

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
