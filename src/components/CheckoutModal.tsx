"use client";

import React, { useState, useEffect } from 'react';
import { ApiError, formatApiErrorMessage, getStoredUser, getUserPhone } from '../lib/api';
import { hotelService } from '@/services/hotelService';
import { packageService } from '@/services/packageService';
import { carService } from '@/services/carService';
import { flightService } from '@/services/flightService';

interface FlightTravelerState {
  id: string;
  traveler_type: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  email: string;
  phone_country_code: string;
  phone: string;
  passport_number: string;
  passport_expiry: string;
  nationality: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  selectedProduct: { 
    type: string; 
    name: string; 
    price: number; 
    payload?: any;
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
  // Primary Contact Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Flight specific multi-travelers state
  const [flightTravelers, setFlightTravelers] = useState<FlightTravelerState[]>([]);

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

  // Vehicle specific fields
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('2026-07-20');
  const [pickupTime, setPickupTime] = useState('09:00');
  const [carHours, setCarHours] = useState(5);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      
      // Auto-populate logged-in user details if available
      const storedUser = getStoredUser();
      let initFirstName = '';
      let initLastName = '';
      let initEmail = '';
      let initPhone = '';

      if (storedUser) {
        initFirstName = storedUser.first_name || '';
        initLastName = storedUser.last_name || '';
        initEmail = storedUser.email || '';
        initPhone = getUserPhone(storedUser);

        setFirstName(initFirstName);
        setLastName(initLastName);
        setEmail(initEmail);
        setPhone(initPhone);
      }

      if (selectedProduct && selectedProduct.type === 'flight') {
        const raw = selectedProduct.payload;
        const travelerPricings: any[] = raw?.travelerPricings || raw?.raw_offer?.travelerPricings || [];

        if (travelerPricings.length > 0) {
          const initial = travelerPricings.map((tp, idx) => ({
            id: tp.travelerId || String(idx + 1),
            traveler_type: tp.travelerType || 'ADULT',
            first_name: idx === 0 ? initFirstName : '',
            last_name: idx === 0 ? initLastName : '',
            date_of_birth: '',
            gender: 'MALE',
            email: idx === 0 ? initEmail : '',
            phone_country_code: '234',
            phone: idx === 0 ? initPhone : '',
            passport_number: '',
            passport_expiry: '',
            nationality: 'NG',
          }));
          setFlightTravelers(initial);
        } else {
          setFlightTravelers([{
            id: '1',
            traveler_type: 'ADULT',
            first_name: initFirstName,
            last_name: initLastName,
            date_of_birth: '',
            gender: 'MALE',
            email: initEmail,
            phone_country_code: '234',
            phone: initPhone,
            passport_number: '',
            passport_expiry: '',
            nationality: 'NG',
          }]);
        }
      }

      if (selectedProduct && (selectedProduct.type === 'hotel' || selectedProduct.type === 'lodging')) {
        const payload = selectedProduct.payload;
        if (payload) {
          if (payload.check_in) setCheckIn(payload.check_in);
          if (payload.check_out) setCheckOut(payload.check_out);
          if (payload.num_guests) setNumGuests(payload.num_guests);
        }
      }

      if (selectedProduct && (selectedProduct.type === 'vehicle' || selectedProduct.type === 'vehicle hire')) {
        const payload = selectedProduct.payload;
        if (payload) {
          if (payload.pickup_date) setPickupDate(payload.pickup_date);
          if (payload.hours) setCarHours(Number(payload.hours));
        }
      }
    }
  }, [isOpen, selectedProduct]);

  if (!isOpen || !selectedProduct) return null;

  const isFlight = selectedProduct.type === 'flight';
  const isHotel = selectedProduct.type === 'hotel';
  const isPackage = selectedProduct.type === 'package' || selectedProduct.type === 'holiday safari' || selectedProduct.type === 'holiday';
  const isVehicle = selectedProduct.type === 'vehicle' || selectedProduct.type === 'vehicle hire';

  const updateFlightTraveler = (index: number, field: keyof FlightTravelerState, value: string) => {
    setFlightTravelers(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const copyContactToTraveler = (index: number) => {
    setFlightTravelers(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
      };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      if (isFlight) {
        // Validate all travelers
        for (let i = 0; i < flightTravelers.length; i++) {
          const t = flightTravelers[i];
          if (!t.first_name.trim() || !t.last_name.trim()) {
            setErrorMessage(`Please enter First and Last Name for Traveler ${i + 1} (${t.traveler_type})`);
            setIsLoading(false);
            return;
          }
          if (!t.date_of_birth) {
            setErrorMessage(`Please select Date of Birth for Traveler ${i + 1} (${t.traveler_type})`);
            setIsLoading(false);
            return;
          }
        }

        const modalFlightOffer = selectedProduct.payload?.raw_offer || selectedProduct.payload;

        const bookingData = await flightService.createBooking({
          flight_offer: modalFlightOffer,
          contact_name: `${firstName} ${lastName}`,
          contact_email: email,
          contact_phone: phone,
          travelers: flightTravelers.map(t => {
            const cleanCode = (t.phone_country_code || '234').replace(/^\+/, '');
            let tType = (t.traveler_type || 'ADULT').toUpperCase();
            if (tType === 'INFANT') tType = 'HELD_INFANT';

            return {
              first_name: t.first_name,
              last_name: t.last_name,
              date_of_birth: t.date_of_birth,
              gender: t.gender,
              email: t.email || email,
              phone_country_code: cleanCode,
              phone: t.phone || phone,
              passport_number: t.passport_number ? t.passport_number.trim() : "",
              passport_expiry: t.passport_expiry || null,
              nationality: t.nationality || 'NG',
              traveler_type: tType
            };
          }),
          callback_url: `${window.location.origin}/api/payments/callback/?type=flight`
        });

        onProceed({ firstName, lastName, email, phone }, bookingData, false);

      } else if (isHotel) {
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
          guest_phone: phone,
          callback_url: `${window.location.origin}/api/payments/callback/?type=hotel`
        });

        onProceed({ firstName, lastName, email, phone }, bookingData, false);

      } else if (isVehicle) {
        // Run car booking API endpoint
        const payload = selectedProduct.payload;
        const vehicleId = payload?.vehicle_id || 1;
        const formattedDateTime = `${pickupDate}T${pickupTime}:00Z`;

        const bookingData = await carService.createBooking({
          vehicle_id: Number(vehicleId),
          pickup_location: pickupLocation,
          dropoff_location: dropoffLocation,
          pickup_datetime: formattedDateTime,
          num_hours: Number(carHours),
          guest_name: `${firstName} ${lastName}`,
          guest_email: email,
          guest_phone: phone,
          callback_url: `${window.location.origin}/api/payments/callback/?type=car`
        });

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

        onProceed({ firstName, lastName, email, phone }, null, true);

      } else {
        onProceed({ firstName, lastName, email, phone }, null, false);
      }
    } catch (error) {
      const details = formatApiErrorMessage(error, "Connection to booking server failed. Please verify details.");
      setErrorMessage(`Booking Failed: ${details}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="checkout-form-modal" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white text-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-purple-100 shadow-2xl overflow-y-auto max-h-[90vh] text-left">
        
        {/* Modal header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-50">
          <div>
            <span className="text-brand-orange text-xs uppercase font-black tracking-widest block font-sans">Checkout Portal</span>
            <h3 className="text-xl font-black text-brand-purple font-sans">
              {isPackage ? "Trip Enquiry Form" : isFlight ? `Passenger Registration (${flightTravelers.length} Passenger${flightTravelers.length > 1 ? 's' : ''})` : "Passenger Registration"}
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
            : isVehicle
              ? selectedProduct.price * Number(carHours)
              : selectedProduct.price;

          return (
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 mb-6">
              <span className="text-xs text-slate-400 font-bold block uppercase mb-1 font-sans">Your Booking Summary</span>
              <h4 className="font-extrabold text-brand-purple text-sm font-sans">{selectedProduct.name}</h4>
              <p className="text-xs text-slate-500 mt-1">
                {isFlight ? `Flight Order · ${flightTravelers.length} Traveler${flightTravelers.length > 1 ? 's' : ''}` : `Primary Segment: ${selectedProduct.type.toUpperCase()}`}
              </p>
              <div className="flex items-center justify-between border-t border-purple-100 mt-3 pt-3 text-xs">
                <span className="text-slate-500 font-semibold">
                  {isHotel ? `Total Estimate (${nightsCount} Night${nightsCount > 1 ? 's' : ''}, ${numRooms} Room${Number(numRooms) > 1 ? 's' : ''}):` : isVehicle ? `Total Estimate (${carHours} Hour${carHours > 1 ? 's' : ''}):` : 'Price Estimate (All Taxes Incl.):'}
                </span>
                <strong className="text-brand-orange font-black text-base">
                  ₦{displayCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </div>
            </div>
          );
        })()}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold">
            {errorMessage}
          </div>
        )}

        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          
          {/* Primary Contact Section */}
          <div className="p-4 border border-purple-100 bg-purple-50/20 rounded-2xl space-y-4">
            <span className="text-xs text-brand-purple uppercase font-black tracking-wider block">
              1. Primary Contact (Ticket Recipient)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Contact First Name</label>
                <input
                  type="text"
                  required
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-white border border-purple-100 rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Contact Last Name</label>
                <input
                  type="text"
                  required
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-white border border-purple-100 rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Email Address (E-Ticket Delivery)</label>
                <input
                  type="email"
                  required
                  placeholder="traveler@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-purple-100 rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +2348012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-purple-100 rounded-xl p-3 text-brand-purple font-semibold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Flight Specific Multi-Traveler Forms */}
          {isFlight && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-brand-orange uppercase font-black tracking-wider">
                  2. Passenger Details ({flightTravelers.length} Passenger{flightTravelers.length > 1 ? 's' : ''})
                </span>
                <span className="text-xs text-slate-400 font-medium">Names must match passport/ID</span>
              </div>

              {flightTravelers.map((traveler, idx) => {
                const badgeBg =
                  traveler.traveler_type === 'ADULT'
                    ? 'bg-purple-100 text-brand-purple'
                    : traveler.traveler_type === 'CHILD'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-800';

                const typeLabel =
                  traveler.traveler_type === 'ADULT'
                    ? 'Adult (18+ yrs)'
                    : traveler.traveler_type === 'CHILD'
                      ? 'Child (2-17 yrs)'
                      : 'Held Infant (Under 2 yrs)';

                return (
                  <div key={idx} className="p-4 border border-slate-200 rounded-2xl space-y-4 bg-white">
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800">Passenger {idx + 1}</span>
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${badgeBg}`}>
                          {typeLabel}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyContactToTraveler(idx)}
                        className="text-xs text-brand-purple font-bold hover:text-brand-orange transition-colors cursor-pointer border-none bg-transparent"
                      >
                        Copy Contact Info
                      </button>
                    </div>

                    {/* Name Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">
                          First Name (as in ID) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="First Name"
                          value={traveler.first_name}
                          onChange={(e) => updateFlightTraveler(idx, 'first_name', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">
                          Last Name (as in ID) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Last Name"
                          value={traveler.last_name}
                          onChange={(e) => updateFlightTraveler(idx, 'last_name', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* DOB & Gender Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">
                          Date of Birth <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={traveler.date_of_birth}
                          onChange={(e) => updateFlightTraveler(idx, 'date_of_birth', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">
                          Gender <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={traveler.gender}
                          onChange={(e) => updateFlightTraveler(idx, 'gender', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none"
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                        </select>
                      </div>
                    </div>

                    {/* Passport & Nationality (Optional for domestic) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">
                          Passport Number <span className="text-slate-300 font-normal">(Optional for domestic)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. A12345678"
                          value={traveler.passport_number}
                          onChange={(e) => updateFlightTraveler(idx, 'passport_number', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">
                          Passport Expiry Date <span className="text-slate-300 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="date"
                          min={todayStr}
                          value={traveler.passport_expiry}
                          onChange={(e) => updateFlightTraveler(idx, 'passport_expiry', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Hotel Specific Inputs */}
          {isHotel && (
            <div className="p-4 border border-purple-50 bg-slate-50/30 rounded-2xl space-y-4">
              <span className="text-xs text-brand-orange uppercase font-extrabold block">Lodging Specifics</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Check-in Date</label>
                  <input
                    type="date"
                    required
                    min={todayStr}
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
                    min={checkIn || todayStr}
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

          {/* Vehicle Specific Inputs */}
          {isVehicle && (
            <div className="p-4 border border-purple-50 bg-slate-50/30 rounded-2xl space-y-4">
              <span className="text-xs text-brand-orange uppercase font-extrabold block">Vehicle Rental Specifics</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Pickup Location</label>
                  <input
                    type="text"
                    required
                    placeholder="Airport or City Location"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full bg-white border border-purple-100 rounded-xl p-2.5 text-brand-purple font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Dropoff Location</label>
                  <input
                    type="text"
                    required
                    placeholder="Dropoff Address"
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    className="w-full bg-white border border-purple-100 rounded-xl p-2.5 text-brand-purple font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Pickup Date</label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full bg-white border border-purple-100 rounded-xl p-2.5 text-brand-purple font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Pickup Time</label>
                  <input
                    type="time"
                    required
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-white border border-purple-100 rounded-xl p-2.5 text-brand-purple font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Duration (Hrs)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={carHours}
                    onChange={(e) => setCarHours(Number(e.target.value))}
                    className="w-full bg-white border border-purple-100 rounded-xl p-2.5 text-brand-purple font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Package Specific Inputs */}
          {isPackage && (
            <div className="p-4 border border-purple-50 bg-slate-50/30 rounded-2xl space-y-4">
              <span className="text-xs text-brand-orange uppercase font-extrabold block">Safari / Package Preference</span>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Travel Date</label>
                  <input
                    type="date"
                    required
                    min={todayStr}
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

          {(() => {
            const isModalFormValid =
              !!firstName.trim() &&
              !!lastName.trim() &&
              !!email.trim() &&
              email.includes('@') &&
              !!phone.trim() &&
              (!isFlight || (flightTravelers.length > 0 && flightTravelers.every(t => !!t.first_name.trim() && !!t.last_name.trim() && !!t.date_of_birth)));

            return (
              <button
                type="submit"
                disabled={isLoading || !isModalFormValid}
                className="w-full bg-brand-orange hover:bg-brand-purple disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FA6432]/10 mt-2 cursor-pointer border-none flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  isPackage ? "Submit Enquiry Info" : "Proceed to Secure Payment"
                )}
              </button>
            );
          })()}

        </form>

      </div>
    </div>
  );
}
