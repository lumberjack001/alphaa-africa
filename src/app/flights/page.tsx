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
import { flightService } from '@/services/flightService';
import { getStoredUser, getUserPhone } from '@/lib/api';

function FlightsQueryPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search parameters from URL
  const originParam = searchParams.get('origin') || 'LOS';
  const destinationParam = searchParams.get('destination') || 'ABV';
  const dateParam = searchParams.get('date') || '2026-07-20';
  const returnDateParam = searchParams.get('return_date') || searchParams.get('checkoutDate') || '';
  const tripTypeParam = searchParams.get('trip_type') || '';
  const cabinParam = searchParams.get('cabin') || 'Economy';
  const adultsParam = Number(searchParams.get('adults') || 1);
  const childrenParam = Number(searchParams.get('children') || 0);
  const infantsParam = Number(searchParams.get('infants') || 0);

  const legsParamRaw = searchParams.get('legs');
  let legsParam: any[] = [];
  if (legsParamRaw) {
    try {
      legsParam = JSON.parse(legsParamRaw);
    } catch (e) {
      legsParam = [];
    }
  }

  // Local Search state
  const [searchQuery, setSearchQuery] = useState({
    origin: originParam,
    destination: destinationParam,
    date: dateParam,
    returnDate: returnDateParam,
    tripType: tripTypeParam,
    cabin: cabinParam,
    adults: adultsParam,
    children: childrenParam,
    infants: infantsParam,
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

  // Pre-fill user profile info if logged in
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setPassengerInfo({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: getUserPhone(user),
      });
    }
  }, []);

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
      returnDate: returnDateParam,
      tripType: tripTypeParam,
      cabin: cabinParam,
      adults: adultsParam,
      children: childrenParam,
      infants: infantsParam,
    });
  }, [originParam, destinationParam, dateParam, returnDateParam, tripTypeParam, cabinParam, adultsParam, childrenParam, infantsParam]);

  // Handle Paystack payment verification from URL reference
  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (reference) {
      const verify = async () => {
        setIsLoading(true);
        try {
          const res = await flightService.verifyBooking(reference);
          setConfirmedTicket({
            passenger: res.customer_email || 'Passenger',
            cabin: `${searchQuery.cabin} Class`,
            hash: `#TK-${reference.substring(0, 8).toUpperCase()}`,
            pnr: res.pnr || res.reference || reference,
            details: {
              carrier: 'Amadeus Airline',
              name: 'Live Flight Ticket',
              number: 'PNR-CONFIRMED',
            },
            type: 'flight',
          });
          triggerToast("Payment verified! Automated E-Ticket issued.");
        } catch (e) {
          console.error("Error verifying flight booking:", e);
        } finally {
          setIsLoading(false);
        }
      };
      verify();
    }
  }, [searchParams, searchQuery.cabin]);

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
    trip_type?: string;
    adults?: number;
    children?: number;
    infants?: number;
    legs?: any[];
  }) => {
    const returnParam = params.checkoutDate ? `&return_date=${encodeURIComponent(params.checkoutDate)}` : '';
    const tripTypeParam = params.trip_type ? `&trip_type=${encodeURIComponent(params.trip_type)}` : '';
    const adultsP = params.adults ? `&adults=${params.adults}` : '';
    const childrenP = params.children !== undefined ? `&children=${params.children}` : '';
    const infantsP = params.infants !== undefined ? `&infants=${params.infants}` : '';
    const legsP = params.legs && params.legs.length > 0 ? `&legs=${encodeURIComponent(JSON.stringify(params.legs))}` : '';

    const searchUrl = `/flights?origin=${encodeURIComponent(params.origin)}&destination=${encodeURIComponent(params.destination)}&date=${encodeURIComponent(params.date)}${returnParam}${tripTypeParam}&cabin=${encodeURIComponent(params.cabin)}${adultsP}${childrenP}${infantsP}${legsP}`;
    router.push(searchUrl);
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

  const handleBookFlight = async (product: { type: string; name: string; price: number; payload?: any }) => {
    setSelectedProduct(product);
    if (product.payload) {
      const rawOffer = product.payload?.raw_offer;
      console.warn("✈️ [BOOK FLIGHT CLICKED] Raw Amadeus Offer:", rawOffer);
      try {
        sessionStorage.setItem('selectedFlightOffer', JSON.stringify(product.payload));
        sessionStorage.setItem('flightSearchContext', JSON.stringify(searchQuery));
        await flightService.confirmPrice(product.payload);
      } catch (e) {
        console.warn("Price confirmation notice:", e);
      }
    }
    router.push('/flights/checkout');
  };

  const handleProceedToBilling = async (
    info: { firstName: string; lastName: string; email: string; phone: string },
    response?: any
  ) => {
    setPassengerInfo(info);
    setIsCheckoutOpen(false);

    if (selectedProduct?.payload) {
      try {
        setIsLoading(true);
        const bookingRes = await flightService.createBooking({
          flight_offer: selectedProduct.payload?.raw_offer || selectedProduct.payload,
          contact_name: `${info.firstName} ${info.lastName}`,
          contact_email: info.email,
          contact_phone: info.phone,
          travelers: [
            {
              first_name: info.firstName,
              last_name: info.lastName,
              email: info.email,
              phone: info.phone,
              traveler_type: 'ADULT'
            }
          ],
          callback_url: `${window.location.origin}/api/payments/callback/?type=flight`
        });

        // if (bookingRes.payment?.authorization_url) {
        //   window.location.href = bookingRes.payment.authorization_url;
        //   return;
        // }

        setBookingResponse(bookingRes);
      } catch (err: any) {
        console.error("Booking creation error:", err);
        triggerToast(err.message || "Failed to create flight booking");
      } finally {
        setIsLoading(false);
      }
    }

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

      <main className="flex-grow navbar-offset">
        
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
                initialSearch={{
                  origin: originParam,
                  destination: destinationParam,
                  departureDate: dateParam,
                  returnDate: returnDateParam,
                  tripType: tripTypeParam,
                  cabin: cabinParam,
                  adults: adultsParam,
                  children: childrenParam,
                  infants: infantsParam,
                  legs: legsParam,
                }}
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
                checkOutDate={searchQuery.returnDate}
                guests={`${searchQuery.adults + searchQuery.children + searchQuery.infants}`}
                stars={searchQuery.cabin}
                adults={searchQuery.adults}
                children={searchQuery.children}
                infants={searchQuery.infants}
                tripType={searchQuery.tripType}
                legs={legsParam}
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
