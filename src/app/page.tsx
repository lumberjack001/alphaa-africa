"use client";

import React, { useState } from 'react';
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

export default function Home() {
  const [activeTab, setActiveTab] = useState('flights');
  
  // Search state
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    origin: 'LOS',
    destination: 'ABV',
  });

  // Modal / Checkout flow state
  const [selectedProduct, setSelectedProduct] = useState<{ type: string; name: string; price: number } | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
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
    cabin: string;
  }) => {
    setSearchParams({
      origin: params.origin,
      destination: params.destination,
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
    setIsSearchVisible(false);
    const el = document.getElementById('booking-engine');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    triggerToast("Booking portal navigation reset.");
  };

  const handleBookProduct = (product: { type: string; name: string; price: number }) => {
    setSelectedProduct(product);
    setIsCheckoutOpen(true);
    triggerToast(`Checkout created for ${product.name}`);
  };

  const handleProceedToBilling = (info: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) => {
    setPassengerInfo(info);
    setIsCheckoutOpen(false);
    setIsBillingOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsBillingOpen(false);

    // Generate simulated PNR and Security Hash
    const mockPnrCode = `PNR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const mockSecHash = `#TK-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Default to business or standard class depending on choice
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
            origin={searchParams.origin}
            destination={searchParams.destination}
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
              origin={searchParams.origin}
              destination={searchParams.destination}
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
        onSuccess={handlePaymentSuccess}
        triggerToast={triggerToast}
      />

      <Toast message={toastMessage} visible={toastVisible} />

    </div>
  );
}
