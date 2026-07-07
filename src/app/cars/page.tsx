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

function CarsQueryPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search parameters from URL
  const vehicleTypeParam = searchParams.get('vehicle_type') || '';
  const hoursParam = searchParams.get('hours') ? Number(searchParams.get('hours')) : 5;
  const dateParam = searchParams.get('date') || '';
  const pickupParam = searchParams.get('pickup') || '';
  const dropoffParam = searchParams.get('dropoff') || '';

  // Local Search state
  const [searchQuery, setSearchQuery] = useState({
    vehicleType: vehicleTypeParam,
    hours: hoursParam,
    date: dateParam,
    pickup: pickupParam,
    dropoff: dropoffParam,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Modal checkout flow states
  const [selectedProduct, setSelectedProduct] = useState<{
    type: string;
    name: string;
    price: number;
    payload?: any;
  } | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [passengerInfo, setPassengerInfo] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }>({ firstName: '', lastName: '', email: '', phone: '' });
  const [bookingResponse, setBookingResponse] = useState<any | null>(null);
  const [confirmedTicket, setConfirmedTicket] = useState<any | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 5000);
  };

  // Sync state with URL search params when they change
  useEffect(() => {
    setSearchQuery({
      vehicleType: vehicleTypeParam,
      hours: hoursParam,
      date: dateParam,
      pickup: pickupParam,
      dropoff: dropoffParam,
    });
  }, [vehicleTypeParam, hoursParam, dateParam, pickupParam, dropoffParam]);

  // Smooth scroll search results into view
  useEffect(() => {
    if (!isLoading) {
      const hasQuery = searchParams.has('vehicle_type') || searchParams.has('pickup');
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
    hours?: number;
  }) => {
    if (params.tab === 'hotels') {
      router.push(`/hotels?destination=${encodeURIComponent(params.origin)}&check_in=${params.date}&check_out=${params.checkoutDate || ''}&guests=${params.destination}&stars=${params.cabin}`);
      return;
    }
    if (params.tab === 'flights') {
      router.push(`/flights?origin=${encodeURIComponent(params.origin)}&destination=${encodeURIComponent(params.destination)}&date=${params.date}&cabin=${encodeURIComponent(params.cabin)}`);
      return;
    }
    if (params.tab === 'tours' || params.tab === 'packages') {
      router.push('/packages');
      return;
    }

    setIsLoading(true);
    triggerToast("Searching active fleet databases...");
    
    // Update the URL parameters
    const query = new URLSearchParams();
    if (params.cabin) query.set('vehicle_type', params.cabin);
    if (params.hours) query.set('hours', params.hours.toString());
    if (params.date) query.set('date', params.date);
    if (params.origin) query.set('pickup', params.origin);
    if (params.origin !== params.destination && params.destination) {
      query.set('dropoff', params.destination);
    }

    router.push(`/cars?${query.toString()}`);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleSwitchTab = (tabId: string) => {
    if (tabId === 'flights') {
      router.push('/flights');
    } else if (tabId === 'hotels') {
      router.push('/hotels');
    } else if (tabId === 'tours' || tabId === 'packages') {
      router.push('/packages');
    } else if (tabId === 'cars') {
      router.push('/cars');
    } else {
      router.push(`/?tab=${tabId}`);
    }
  };

  // Checkout Book trigger
  const handleBookProduct = (item: { type: string; name: string; price: number; payload?: any }) => {
    setSelectedProduct(item);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutProceed = (
    info: { firstName: string; lastName: string; email: string; phone: string },
    response: any,
    isEnquiry?: boolean
  ) => {
    setPassengerInfo(info);
    setIsCheckoutOpen(false);
    
    if (response) {
      setBookingResponse(response);
    }
    setIsBillingOpen(true);
  };

  const handlePaymentSuccess = (verifiedBooking?: any) => {
    setIsBillingOpen(false);

    if (verifiedBooking) {
      setConfirmedTicket({
        passenger: verifiedBooking.guest_name || `${passengerInfo.firstName} ${passengerInfo.lastName}`,
        cabin: verifiedBooking.vehicle?.vehicle_type_display || 'Chauffeur Vehicle Rental',
        hash: `#TX-${verifiedBooking.reference}`,
        pnr: verifiedBooking.reference,
        details: {
          name: selectedProduct?.name,
          carrier: selectedProduct?.name,
        },
        type: 'vehicle',
      });
    } else {
      const mockPnrCode = `PNR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const mockSecHash = `#TK-${Math.floor(100000 + Math.random() * 900000)}`;

      setConfirmedTicket({
        passenger: `${passengerInfo.firstName} ${passengerInfo.lastName}`,
        cabin: 'Chauffeur Vehicle Rental',
        hash: mockSecHash,
        pnr: mockPnrCode,
        details: {
          carrier: selectedProduct?.name,
          name: selectedProduct?.name,
        },
        type: 'vehicle',
      });
    }

    triggerToast("Automated E-Ticket successfully delivered!");
    
    setTimeout(() => {
      const el = document.getElementById('boarding-pass-eticket-viewport');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleResetNavigation = () => {
    setConfirmedTicket(null);
    setSelectedProduct(null);
    router.push('/cars');
  };

  return (
    <div className="bg-[#FAF8F5] text-slate-800 antialiased min-h-screen flex flex-col justify-between selection:bg-[#FA6432] selection:text-white">
      <Navbar
        onSwitchTab={handleSwitchTab}
        onReset={handleResetNavigation}
        activeTab="cars"
      />

      <main className="flex-grow">
        {confirmedTicket ? (
          <BoardingPass
            confirmedTicket={confirmedTicket}
            onReset={handleResetNavigation}
            origin={searchQuery.pickup}
            destination={searchQuery.dropoff || searchQuery.pickup}
          />
        ) : (
          <>
            {/* Banner Section */}
            <div className="bg-gradient-to-br from-[#4C1D5C] to-[#2E1238] text-white pt-16 pb-28 px-4 text-center">
              <h1 className="text-3xl sm:text-4xl font-black font-sans uppercase tracking-tight">
                Chauffeur Car Hire
              </h1>
              <p className="text-sm text-purple-100 mt-2 font-semibold">
                Select your preferred premium vehicle hire option with professional driver included
              </p>
            </div>

            {/* Floating Search Widget */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-16 relative z-10">
              <SearchWidget
                activeTab="cars"
                onSwitchTab={handleSwitchTab}
                onSearch={handleSearchSubmit}
              />
            </div>

            {/* Listings Results */}
            <div className="mt-8">
              <Listings
                activeTab="cars"
                isVisible={true}
                isLoading={isLoading}
                onReset={handleResetNavigation}
                onBook={handleBookProduct}
                origin={searchQuery.pickup}
                destination={searchQuery.dropoff || searchQuery.pickup}
                checkInDate={searchQuery.date}
                stars={searchQuery.vehicleType}
                hours={searchQuery.hours}
              />
            </div>
          </>
        )}
      </main>

      <Footer onSwitchTab={handleSwitchTab} triggerToast={triggerToast} />
      
      {/* Checkout Forms Modals */}
      {selectedProduct && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          selectedProduct={selectedProduct}
          onDismiss={() => {
            setIsCheckoutOpen(false);
            setSelectedProduct(null);
          }}
          onProceed={handleCheckoutProceed}
        />
      )}

      {selectedProduct && isBillingOpen && (
        <BillingModal
          isOpen={isBillingOpen}
          passengerEmail={passengerInfo.email}
          totalCost={
            selectedProduct.type === 'vehicle' 
              ? selectedProduct.price * searchQuery.hours 
              : selectedProduct.price
          }
          bookingResponse={bookingResponse}
          onSuccess={handlePaymentSuccess}
          onDismiss={() => {
            setIsBillingOpen(false);
            setSelectedProduct(null);
          }}
          triggerToast={triggerToast}
        />
      )}

      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}

export default function CarsQueryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CarsQueryPageContent />
    </Suspense>
  );
}
