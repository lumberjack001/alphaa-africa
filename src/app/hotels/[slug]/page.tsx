"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import CheckoutModal from '@/components/CheckoutModal';
import BillingModal from '@/components/BillingModal';
import BoardingPass from '@/components/BoardingPass';
import { ApiError } from '@/lib/api';
import { hotelService } from '@/services/hotelService';

function HotelDetailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { slug } = useParams() as { slug: string };

  // Search parameters from URL (to prefill room choices & checkout dates)
  const checkInParam = searchParams.get('check_in') || '2026-07-20';
  const checkOutParam = searchParams.get('check_out') || '2026-07-27';
  const guestsParam = searchParams.get('guests') || '2 Guests';

  // Hotel details state
  const [hotel, setHotel] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 5000);
  };

  // Fetch hotel details from API
  useEffect(() => {
    if (!slug) return;
    
    const fetchHotelDetails = async () => {
      setIsLoading(true);
      try {
        const data = await hotelService.getHotelDetails(slug);
        setHotel(data);
      } catch (error) {
        console.error("Could not fetch hotel details from API:", error);
        setHotel(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotelDetails();
  }, [slug]);

  const handleBookRoom = (room: any) => {
    let guestsVal = 2;
    if (guestsParam) {
      if (guestsParam.includes('1')) guestsVal = 1;
      else if (guestsParam.toLowerCase().includes('family')) guestsVal = 4;
    }

    setSelectedProduct({
      type: 'hotel',
      name: `${hotel.name} - ${room.name}`,
      price: room.price_per_night,
      payload: {
        hotel_id: hotel.id,
        room_type_id: room.id,
        check_in: checkInParam,
        check_out: checkOutParam,
        num_guests: guestsVal,
      }
    });
    setIsCheckoutOpen(true);
    triggerToast(`Booking initialized for ${room.name}`);
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

  const handlePaymentSuccess = (verifiedBooking?: any) => {
    setIsBillingOpen(false);
    if (verifiedBooking) {
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
      const mockPnrCode = `PNR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const mockSecHash = `#TK-${Math.floor(100000 + Math.random() * 900000)}`;

      setConfirmedTicket({
        passenger: `${passengerInfo.firstName} ${passengerInfo.lastName}`,
        cabin: 'Premium Cabin',
        hash: mockSecHash,
        pnr: mockPnrCode,
        details: {
          carrier: selectedProduct?.name,
          name: selectedProduct?.name,
        },
        type: 'hotel',
      });
    }

    triggerToast("Automated Lodging E-Ticket successfully delivered!");
  };

  const handleResetNavigation = () => {
    setConfirmedTicket(null);
    setBookingResponse(null);
    router.push('/hotels');
  };

  if (isLoading) {
    return (
      <div className="bg-[#FAF8F5] min-h-screen flex flex-col justify-between">
        <Navbar onSwitchTab={(tabId) => router.push(`/?tab=${tabId}`)} onReset={() => router.push('/')} activeTab="hotels" />
        <div className="flex-grow flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Premium Lodging Details...</p>
          </div>
        </div>
        <Footer onSwitchTab={() => {}} triggerToast={triggerToast} />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="bg-[#FAF8F5] text-slate-800 antialiased min-h-screen flex flex-col justify-between selection:bg-[#FA6432] selection:text-white">
        <Navbar onSwitchTab={(tabId) => router.push(`/?tab=${tabId}`)} onReset={() => router.push('/')} activeTab="hotels" />
        <div className="flex-grow flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <span className="text-4xl block">🏨</span>
            <h2 className="text-lg font-black text-brand-purple uppercase tracking-tight">Accommodation Details Unavailable</h2>
            <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">This hotel could not be loaded from the backend API. Please check your network connection or try another search selection.</p>
            <button
              onClick={() => router.push('/hotels')}
              className="bg-brand-purple hover:bg-brand-orange text-white font-extrabold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all border-none cursor-pointer mt-4"
            >
              Back to hotels list
            </button>
          </div>
        </div>
        <Footer onSwitchTab={() => {}} triggerToast={triggerToast} />
        <Toast message={toastMessage} visible={toastVisible} />
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] text-slate-800 antialiased min-h-screen flex flex-col justify-between selection:bg-[#FA6432] selection:text-white">
      <Navbar
        onSwitchTab={(tabId) => router.push(`/?tab=${tabId}`)}
        onReset={() => router.push('/')}
        activeTab="hotels"
      />

      <main className="flex-grow">
        {confirmedTicket ? (
          <div className="py-12">
            <BoardingPass
              confirmedTicket={confirmedTicket}
              onReset={handleResetNavigation}
              origin={hotel.city}
              destination={hotel.country}
            />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 text-left">
            {/* Header metadata */}
            <div className="mb-8 border-b border-purple-100 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-brand-orange text-xs font-black uppercase tracking-wider block mb-1">
                  📍 {hotel.city}, {hotel.country}
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-brand-purple font-sans leading-none uppercase">
                  {hotel.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-purple-100 text-brand-purple text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {hotel.star_rating} Stars
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">• Option Verified and Approved</span>
                </div>
              </div>
              <button
                onClick={() => router.back()}
                className="text-xs font-bold text-slate-400 hover:text-brand-orange underline border-none bg-transparent cursor-pointer self-start"
              >
                ← Back to listings
              </button>
            </div>

            {/* Main Showcase / Gallery & Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-2 space-y-6">
                {/* Main image */}
                <div className="relative h-96 w-full rounded-3xl overflow-hidden shadow-md border border-purple-100/40">
                  <img
                    src={hotel.main_image}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Description */}
                <div className="bg-white rounded-3xl p-6 border border-purple-50 shadow-sm">
                  <h3 className="font-extrabold text-brand-purple text-lg mb-3">About The Accommodation</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {hotel.description}
                  </p>
                </div>
              </div>

              {/* Sidebar with gallery and amenities */}
              <div className="space-y-6">
                {/* Gallery preview */}
                <div className="bg-white rounded-3xl p-6 border border-purple-50 shadow-sm space-y-3">
                  <h3 className="font-extrabold text-brand-purple text-sm uppercase tracking-wider">Hotel Gallery</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {hotel.gallery_images?.map((img: string, idx: number) => (
                      <div key={idx} className="h-20 rounded-xl overflow-hidden border border-purple-50">
                        <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities checklist */}
                <div className="bg-white rounded-3xl p-6 border border-purple-50 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-brand-purple text-sm uppercase tracking-wider">Amenities Included</h3>
                  <div className="flex flex-wrap gap-2">
                    {hotel.amenities_list?.map((amenity: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-[#F6EFF7] text-brand-purple text-[10px] font-black px-3.5 py-1.5 rounded-xl block border border-brand-purple/5"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Room variant selection list */}
            <div>
              <h2 className="text-2xl font-black text-brand-purple uppercase tracking-tight mb-6 font-sans">
                Select Accomodation Variant
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hotel.room_types?.map((room: any) => (
                  <div
                    key={room.id}
                    className="bg-white rounded-3xl border border-purple-100 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    {/* Room image */}
                    {room.image && (
                      <div className="h-48 w-full relative">
                        <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-3 left-3 bg-brand-purple/90 backdrop-blur text-white text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                          Max {room.max_guests} Guests
                        </span>
                      </div>
                    )}
                    
                    {/* Room specifications */}
                    <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-extrabold text-brand-purple text-base leading-tight mb-1">
                          {room.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                          {room.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-purple-50 pt-4 mt-2">
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Price / Night</span>
                          <strong className="text-xl font-black text-brand-purple">
                            ₦{Number(room.price_per_night).toLocaleString()}
                          </strong>
                        </div>
                        <button
                          onClick={() => handleBookRoom(room)}
                          className="bg-brand-orange hover:bg-brand-purple text-white font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all border-none cursor-pointer"
                        >
                          Book Option
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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

export default function HotelDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    }>
      <HotelDetailPageContent />
    </Suspense>
  );
}
