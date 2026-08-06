"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import FlightCheckoutSummary from '@/components/checkout/FlightCheckoutSummary';
import TravellerDetailsForm, { type ContactFormData, type PassengerFormData } from '@/components/checkout/TravellerDetailsForm';
import CheckoutSidebar from '@/components/checkout/CheckoutSidebar';
import BillingModal from '@/components/BillingModal';
import BoardingPass from '@/components/BoardingPass';
import { flightService, type FlightOfferResult } from '@/services/flightService';
import { apiFetch, getStoredUser, setStoredUser, getUserPhone, type User } from '@/lib/api';

function parsePhoneAndCode(rawPhone: string) {
  if (!rawPhone) return { code: '+234', phone: '' };
  
  let p = rawPhone.trim().replace(/[\s\-\(\)]/g, '');
  let code = '+234';
  let phone = p;

  if (p.startsWith('+234')) {
    code = '+234';
    phone = p.substring(4);
  } else if (p.startsWith('234')) {
    code = '+234';
    phone = p.substring(3);
  } else if (p.startsWith('+1')) {
    code = '+1';
    phone = p.substring(2);
  } else if (p.startsWith('+44')) {
    code = '+44';
    phone = p.substring(3);
  } else if (p.startsWith('+27')) {
    code = '+27';
    phone = p.substring(3);
  } else if (p.startsWith('+254')) {
    code = '+254';
    phone = p.substring(4);
  } else if (p.startsWith('+233')) {
    code = '+233';
    phone = p.substring(4);
  } else if (p.startsWith('+971')) {
    code = '+971';
    phone = p.substring(4);
  } else if (p.startsWith('0')) {
    code = '+234';
    phone = p.substring(1);
  }

  return { code, phone };
}

function FlightCheckoutContent() {
  const router = useRouter();

  const [offer, setOffer] = useState<any | null>(null);
  const [searchContext, setSearchContext] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Billing modal & confirmation ticket states
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [bookingResponse, setBookingResponse] = useState<any | null>(null);
  const [confirmedTicket, setConfirmedTicket] = useState<any | null>(null);

  // Contact Info state
  const [contactInfo, setContactInfo] = useState<ContactFormData>({
    email: '',
    phoneCountryCode: '+234',
    phone: '',
    createProfile: true,
    termsAgreed: true,
  });

  // Passengers list state
  const [passengers, setPassengers] = useState<PassengerFormData[]>([]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 5000);
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

  // 1. Load stored offer & context from sessionStorage on mount + fetch user profile
  useEffect(() => {
    try {
      const storedOffer = sessionStorage.getItem('selectedFlightOffer');
      const storedContext = sessionStorage.getItem('flightSearchContext');

      if (!storedOffer) {
        router.push('/flights');
        return;
      }

      const parsedOffer = JSON.parse(storedOffer);
      const parsedContext = storedContext ? JSON.parse(storedContext) : {};

      setOffer(parsedOffer);
      setSearchContext(parsedContext);

      // Pre-fill user from localStorage
      const user = getStoredUser();
      const initialEmail = user?.email || '';
      const initialPhone = getUserPhone(user);
      const initialFirstName = user?.first_name || '';
      const initialLastName = user?.last_name || '';

      if (user) {
        setIsLoggedIn(true);
        const parsed = parsePhoneAndCode(initialPhone);
        setContactInfo((prev) => ({
          ...prev,
          email: initialEmail || prev.email,
          phoneCountryCode: parsed.code,
          phone: parsed.phone || prev.phone,
        }));

        // Asynchronously fetch fresh user profile from backend to get phone_number if missing from cached localStorage
        apiFetch<User>('/api/auth/me/')
          .then((freshUser) => {
            if (freshUser) {
              setStoredUser(freshUser);
              const freshPhone = getUserPhone(freshUser);
              const freshParsed = parsePhoneAndCode(freshPhone);
              setContactInfo((prev) => ({
                ...prev,
                email: freshUser.email || prev.email,
                phoneCountryCode: freshParsed.code,
                phone: freshParsed.phone || prev.phone,
              }));

              // Update lead passenger name if missing
              setPassengers((prevPass) => {
                if (prevPass.length > 0 && !prevPass[0].firstName) {
                  const copy = [...prevPass];
                  copy[0] = {
                    ...copy[0],
                    firstName: freshUser.first_name || copy[0].firstName,
                    lastName: freshUser.last_name || copy[0].lastName,
                  };
                  return copy;
                }
                return prevPass;
              });
            }
          })
          .catch((err) => {
            console.warn("Using cached profile for checkout:", err);
          });
      }

      // Generate dynamic passengers array based on counts
      const adultCount = Number(parsedContext.adults || 1);
      const childCount = Number(parsedContext.children || 0);
      const infantCount = Number(parsedContext.infants || 0);

      const generatedPassengers: PassengerFormData[] = [];

      // Adults
      for (let i = 0; i < adultCount; i++) {
        generatedPassengers.push({
          id: `adult_${i + 1}`,
          type: 'ADULT',
          label: i === 0 ? 'Lead Traveller (Adult 1)' : `Passenger ${i + 1} (Adult)`,
          title: 'Mr',
          firstName: i === 0 ? initialFirstName : '',
          lastName: i === 0 ? initialLastName : '',
          dobDay: '',
          dobMonth: '',
          dobYear: '',
          gender: 'MALE',
          nationality: 'NG',
        });
      }

      // Children
      for (let i = 0; i < childCount; i++) {
        generatedPassengers.push({
          id: `child_${i + 1}`,
          type: 'CHILD',
          label: `Child ${i + 1} (2-17 yrs)`,
          title: 'Master',
          firstName: '',
          lastName: '',
          dobDay: '',
          dobMonth: '',
          dobYear: '',
          gender: 'MALE',
          nationality: 'NG',
        });
      }

      // Infants
      for (let i = 0; i < infantCount; i++) {
        generatedPassengers.push({
          id: `infant_${i + 1}`,
          type: 'INFANT',
          label: `Infant ${i + 1} (Under 2 yrs)`,
          title: 'Master',
          firstName: '',
          lastName: '',
          dobDay: '',
          dobMonth: '',
          dobYear: '',
          gender: 'MALE',
          nationality: 'NG',
        });
      }

      setPassengers(generatedPassengers);

    } catch (e) {
      console.error('Error loading checkout state:', e);
      router.push('/flights');
    }
  }, [router]);

  // Proceed to Payment Handler
  const handleProceedToPay = async () => {
    if (!offer) return;

    // Validation
    if (!contactInfo.email || !contactInfo.phone) {
      triggerToast('Please provide a valid email address and phone number for ticket delivery.');
      return;
    }

    if (!contactInfo.termsAgreed) {
      triggerToast('Please accept the Terms & Conditions to proceed.');
      return;
    }

    for (let p of passengers) {
      if (!p.firstName.trim() || !p.lastName.trim()) {
        triggerToast(`Please enter the complete name for ${p.label}.`);
        return;
      }
    }

    setIsLoading(true);

    try {
      const formattedTravelers = passengers.map((p) => {
        const dob = (p.dobYear && p.dobMonth && p.dobDay) ? `${p.dobYear}-${p.dobMonth}-${p.dobDay}` : undefined;
        const passportExpiry = (p.passportExpiryYear && p.passportExpiryMonth && p.passportExpiryDay)
          ? `${p.passportExpiryYear}-${p.passportExpiryMonth}-${p.passportExpiryDay}`
          : null;

        return {
          first_name: p.firstName,
          last_name: p.lastName,
          date_of_birth: dob,
          gender: p.gender,
          email: contactInfo.email,
          phone_country_code: contactInfo.phoneCountryCode,
          phone: contactInfo.phone,
          passport_number: p.passportNumber || undefined,
          passport_expiry: passportExpiry,
          nationality: p.nationality || 'NG',
          traveler_type: p.type,
        };
      });

      const leadPassenger = passengers[0] || { firstName: 'Traveler', lastName: '' };
      const contactName = `${leadPassenger.firstName} ${leadPassenger.lastName}`.trim();

      const bookingRes = await flightService.createBooking({
        flight_offer: offer.raw_offer || offer,
        contact_name: contactName || contactInfo.email,
        contact_email: contactInfo.email,
        contact_phone: `${contactInfo.phoneCountryCode}${contactInfo.phone}`,
        travelers: formattedTravelers,
      });

      if (bookingRes?.payment?.authorization_url) {
        window.location.href = bookingRes.payment.authorization_url;
        return;
      }

      setBookingResponse(bookingRes);
      setIsBillingOpen(true);

    } catch (err: any) {
      console.error('Booking error:', err);
      triggerToast(err.message || 'Failed to initialize booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBillingSuccess = () => {
    setIsBillingOpen(false);
    const leadTraveler = passengers[0];
    const leadName = leadTraveler ? `${leadTraveler.firstName} ${leadTraveler.lastName}` : contactInfo.email;
    const itinerary = offer?.itineraries?.[0];
    const carrier = offer?.airline || 'Airline';

    setConfirmedTicket({
      passenger: leadName,
      cabin: offer?.cabin || 'Economy',
      hash: `#TK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      pnr: bookingResponse?.pnr || 'PNR-CONFIRMED',
      details: {
        carrier: carrier,
        name: `${searchContext?.origin || 'LOS'} to ${searchContext?.destination || 'LHR'}`,
        number: itinerary?.segments?.[0]?.flight_number || 'FL-101',
      },
      type: 'flight',
    });

    triggerToast('Payment confirmed! Your ticket has been issued.');
  };

  if (!offer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-purple-100">
          <div className="animate-spin h-8 w-8 text-brand-purple mx-auto mb-4 border-2 border-brand-purple border-t-transparent rounded-full"></div>
          <p className="text-slate-600 text-sm font-bold">Loading your booking details...</p>
        </div>
      </div>
    );
  }

  const extractTotalPrice = (off: any) => {
    if (!off) return 0;
    if (typeof off.price === 'number') return off.price;
    if (typeof off.price === 'string') return parseFloat(off.price) || 0;
    if (off.price?.grandTotal) return parseFloat(off.price.grandTotal) || 0;
    if (off.price?.total) return parseFloat(off.price.total) || 0;
    if (off.raw_offer?.price?.grandTotal) return parseFloat(off.raw_offer.price.grandTotal) || 0;
    if (off.raw_offer?.price?.total) return parseFloat(off.raw_offer.price.total) || 0;
    return 0;
  };

  const numericTotal = extractTotalPrice(offer);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar
        activeTab="flights"
        onSwitchTab={handleSwitchTab}
        onReset={() => router.push('/flights')}
      />

      {/* Main Page Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Top Header Navigation Row */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-purple-100">
          <button
            onClick={() => router.back()}
            type="button"
            className="text-xs font-black text-brand-purple hover:text-brand-orange flex items-center gap-1.5 transition-colors uppercase tracking-wider cursor-pointer border-none bg-transparent p-0"
          >
            <svg className="w-4 h-4 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Flight Results
          </button>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-brand-purple uppercase">
            Checkout
          </h1>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Booking Summary & Traveller Details */}
          <div className="lg:col-span-8">
            <FlightCheckoutSummary offer={offer} searchContext={searchContext} />
            <TravellerDetailsForm
              contactInfo={contactInfo}
              setContactInfo={setContactInfo}
              passengers={passengers}
              setPassengers={setPassengers}
              isLoggedIn={isLoggedIn}
            />
          </div>

          {/* Right Column: Sticky Pricing Sidebar */}
          <div className="lg:col-span-4">
            <CheckoutSidebar
              offer={offer}
              searchContext={searchContext}
              onProceedToPay={handleProceedToPay}
              isLoading={isLoading}
              canProceed={contactInfo.termsAgreed && !!contactInfo.email && !!contactInfo.phone}
            />
          </div>
        </div>
      </div>

      <Footer onSwitchTab={handleSwitchTab} triggerToast={triggerToast} />

      {/* Toast Notification */}
      <Toast message={toastMessage} visible={toastVisible} />

      {/* Billing Modal */}
      {isBillingOpen && (
        <BillingModal
          isOpen={isBillingOpen}
          passengerEmail={contactInfo.email}
          totalCost={numericTotal}
          bookingResponse={bookingResponse}
          onSuccess={handleBillingSuccess}
          onDismiss={() => setIsBillingOpen(false)}
          triggerToast={triggerToast}
        />
      )}

      {/* Confirmed E-Ticket Modal */}
      {confirmedTicket && (
        <BoardingPass
          confirmedTicket={confirmedTicket}
          onReset={() => router.push('/flights')}
          origin={searchContext?.origin || 'LOS'}
          destination={searchContext?.destination || 'LHR'}
        />
      )}
    </main>
  );
}

export default function FlightCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 text-brand-purple border-2 border-brand-purple border-t-transparent rounded-full"></div>
      </div>
    }>
      <FlightCheckoutContent />
    </Suspense>
  );
}
