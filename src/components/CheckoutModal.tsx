"use client";

import React, { useState, useEffect } from 'react';
import { ApiError, getStoredUser } from '../lib/api';
import { hotelService } from '@/services/hotelService';
import { packageService } from '@/services/packageService';

interface CheckoutModalProps {
  isOpen: boolean;
  selectedProduct: { 
    type: string; 
    name: string; 
    price: number; 
    payload?: { 
      hotel_id?: number | string; 
      room_type_id?: number | string;
      slug?: string;
      check_in?: string;
      check_out?: string;
      num_guests?: number;
    } 
  } | null;
  onDismiss: () => void;
  onProceed: (
    passengerInfo: { firstName: string; lastName: string; email: string; phone: string },
    bookingResponse?: any,
    isEnquiry?: boolean
  ) => void;
}

export default function CheckoutModal({
  isOpen,
  selectedProduct,
  onDismiss,
  onProceed
}: CheckoutModalProps) {
  // Bio Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Hotels specific fields
  const [checkIn, setCheckIn] = useState('2026-07-15');
  const [checkOut, setCheckOut] = useState('2026-07-18');
  const [numRooms, setNumRooms] = useState(1);
  const [numGuests, setNumGuests] = useState(2);

  // Packages specific fields
  const [preferredDate, setPreferredDate] = useState('2026-08-10');
  const [numAdults, setNumAdults] = useState(2);
  const [numChildren, setNumChildren] = useState(0);
  const [enquiryMessage, setEnquiryMessage] = useState('Interested in booking this curated holiday packages safari trip.');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      
      // Auto-populate logged-in user details if available
      const storedUser = getStoredUser();
      if (storedUser) {
        setFirstName(storedUser.first_name || '');
        setLastName(storedUser.last_name || '');
        setEmail(storedUser.email || '');
        setPhone(storedUser.phone_number || '');
      }

      if (selectedProduct && (selectedProduct.type === 'hotel' || selectedProduct.type === 'lodging')) {
        const payload = selectedProduct.payload;
        if (payload) {
          if (payload.check_in) setCheckIn(payload.check_in);
          if (payload.check_out) setCheckOut(payload.check_out);
          if (payload.num_guests) setNumGuests(payload.num_guests);
        }
      }
    }
  }, [isOpen, selectedProduct]);

  if (!isOpen || !selectedProduct) return null;

  const isHotel = selectedProduct.type === 'hotel';
  const isPackage = selectedProduct.type === 'package' || selectedProduct.type === 'holiday safari' || selectedProduct.type === 'holiday';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      if (isHotel) {
        // Run hotel booking API endpoint
        const payload = selectedProduct.payload;
        const hotelId = payload?.hotel_id || 1;
        const roomTypeId = payload?.room_type_id || 1;

        const bookingData = await hotelService.createBooking({
          hotel_id: Number(hotelId),
          room_type_id: Number(roomTypeId),
          check_in: checkIn,
          check_out: checkOut,
          num_rooms: Number(numRooms),
          num_guests: Number(numGuests),
          guest_name: `${firstName} ${lastName}`,
          guest_email: email,
          guest_phone: phone
        });

        // Booking successful -> proceed to billing modal with api transaction response details
        onProceed({ firstName, lastName, email, phone }, bookingData, false);
      } else if (isPackage) {
        // Resolve package slug
        const slug = selectedProduct.payload?.slug || selectedProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        await packageService.submitEnquiry(slug, {
          full_name: `${firstName} ${lastName}`,
          email: email,
          phone: phone,
          preferred_date: preferredDate,
          num_adults: Number(numAdults),
          num_children: Number(numChildren),
          message: enquiryMessage
        });

        // Enquiry successful -> proceed directly to receipt pass
        onProceed({ firstName, lastName, email, phone }, null, true);
      } else {
        // Fallback for Flight or Car Hire which uses local states
        onProceed({ firstName, lastName, email, phone }, null, false);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const details = error.data ? Object.entries(error.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ") : error.message;
        setErrorMessage(`Registration Failed: ${details}`);
      } else {
        setErrorMessage("Connection to booking server failed. Please verify details.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="checkout-form-modal" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white text-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-purple-100 shadow-2xl overflow-y-auto max-h-[90vh] text-left">
        
        {/* Modal header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-50">
          <div>
            <span className="text-brand-orange text-[10px] uppercase font-black tracking-widest block font-sans">Checkout Portal</span>
            <h3 className="text-xl font-black text-brand-purple font-sans">
              {isPackage ? "Trip Enquiry Form" : "Passenger Registration"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="text-slate-400 hover:text-brand-orange text-xl font-bold p-1 cursor-pointer border-none bg-transparent"
          >
            ✕
          </button>
        </div>

        {/* Selection details container */}
        {(() => {
          const calculateNights = () => {
            if (!checkIn || !checkOut) return 1;
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            const diffTime = end.getTime() - start.getTime();
            if (diffTime <= 0) return 1;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays || 1;
          };

          const nightsCount = calculateNights();
          const displayCost = isHotel 
            ? selectedProduct.price * nightsCount * Number(numRooms) 
            : selectedProduct.price;

          return (
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 mb-6">
              <span className="text-[9px] text-slate-400 font-bold block uppercase mb-1 font-sans">Your Booking Summary</span>
              <h4 className="font-extrabold text-brand-purple text-sm font-sans">{selectedProduct.name}</h4>
              <p className="text-xs text-slate-500 mt-1">Primary Segment: {selectedProduct.type.toUpperCase()}</p>
              <div className="flex items-center justify-between border-t border-purple-100 mt-3 pt-3 text-xs">
                <span className="text-slate-500 font-semibold">
                  {isHotel ? `Total Estimate (${nightsCount} Night${nightsCount > 1 ? 's' : ''}, ${numRooms} Room${Number(numRooms) > 1 ? 's' : ''}):` : 'Price Estimate:'}
                </span>
                <strong className="text-brand-orange font-black text-base">
                  ₦{displayCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </div>
            </div>
          );
        })()}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-[11px] font-bold">
            {errorMessage}
          </div>
        )}

        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 font-bold mb-1">First Name (As in Passport)</label>
              <input
                type="text"
                required
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-purple-50/30 border border-purple-100 rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-bold mb-1">Last Name (As in Passport)</label>
              <input
                type="text"
                required
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-purple-50/30 border border-purple-100 rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 font-bold mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="traveler@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-purple-50/30 border border-purple-100 rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-bold mb-1">Phone Number</label>
              <input
                type="tel"
                required
                placeholder="+234 812 345 6789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-purple-50/30 border border-purple-100 rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
              />
            </div>
          </div>

          {/* Hotel Specific Inputs */}
          {isHotel && (
            <div className="p-4 border border-purple-50 bg-slate-50/30 rounded-2xl space-y-4">
              <span className="text-[9px] text-brand-orange uppercase font-extrabold block">Lodging Specifics</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Check-in Date</label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-white border border-purple-100 rounded-xl p-2.5 text-brand-purple font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Check-out Date</label>
                  <input
                    type="date"
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-white border border-purple-100 rounded-xl p-2.5 text-brand-purple font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">No. of Rooms</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={numRooms}
                    onChange={(e) => setNumRooms(Number(e.target.value))}
                    className="w-full bg-white border border-purple-100 rounded-xl p-2.5 text-brand-purple font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Total Guests</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={numGuests}
                    onChange={(e) => setNumGuests(Number(e.target.value))}
                    className="w-full bg-white border border-purple-100 rounded-xl p-2.5 text-brand-purple font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Package Specific Inputs */}
          {isPackage && (
            <div className="p-4 border border-purple-50 bg-slate-50/30 rounded-2xl space-y-4">
              <span className="text-[9px] text-brand-orange uppercase font-extrabold block">Safari / Tour Specifics</span>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-slate-500 font-bold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-white border border-purple-100 rounded-xl p-2.5 text-brand-purple font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Adults</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={numAdults}
                    onChange={(e) => setNumAdults(Number(e.target.value))}
                    className="w-full bg-white border border-purple-100 rounded-xl p-2.5 text-brand-purple font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Children</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={numChildren}
                    onChange={(e) => setNumChildren(Number(e.target.value))}
                    className="w-full bg-white border border-purple-100 rounded-xl p-2.5 text-brand-purple font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Enquiry message</label>
                <textarea
                  rows={2}
                  required
                  value={enquiryMessage}
                  onChange={(e) => setEnquiryMessage(e.target.value)}
                  className="w-full bg-white border border-purple-100 rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-orange hover:bg-brand-purple text-white font-black py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FA6432]/10 mt-2 cursor-pointer border-none flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              isPackage ? "Submit Enquiry Info" : "Proceed to Secure Payment"
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
