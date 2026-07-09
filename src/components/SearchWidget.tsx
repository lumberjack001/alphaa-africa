"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';
import TravellersSelect from './TravellersSelect';

interface SearchWidgetProps {
  activeTab: string;
  onSwitchTab: (tabId: string) => void;
  onSearch: (searchParams: {
    tab: string;
    origin: string;
    destination: string;
    date: string;
    checkoutDate?: string;
    cabin: string;
    hours?: number;
  }) => void;
}

export default function SearchWidget({ activeTab, onSwitchTab, onSearch }: SearchWidgetProps) {
  const [origin, setOrigin] = useState('LOS');
  const [destination, setDestination] = useState('ABV');
  const [date, setDate] = useState('2026-07-20');
  const [checkoutDate, setCheckoutDate] = useState('2026-07-27');
  const [cabinClass, setCabinClass] = useState('Economy');

  // Flight tab states
  const [tripType, setTripType] = useState<'round-trip' | 'one-way' | 'multi-city'>('round-trip');
  const [flightOrigin, setFlightOrigin] = useState('LOS');
  const [flightDestination, setFlightDestination] = useState('ABV');
  const [departureDate, setDepartureDate] = useState('2026-07-20');
  const [returnDate, setReturnDate] = useState('2026-07-27');
  const [flightCabinClass, setFlightCabinClass] = useState('Economy');

  // Travellers Popover states
  const [adultsCount, setAdultsCount] = useState(1);
  const [rentalHours, setRentalHours] = useState(5);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infantsCount, setInfantsCount] = useState(0);

  // Multi-city states
  const [multiCityFlights, setMultiCityFlights] = useState([
    { origin: 'LOS', destination: 'ABV', date: '2026-07-20', cabinClass: 'Economy' },
    { origin: 'ABV', destination: 'DXB', date: '2026-07-27', cabinClass: 'Economy' },
  ]);

  const flightAirports = [
    { value: "LOS", label: "Lagos, Nigeria (LOS)" },
    { value: "ABV", label: "Abuja, Nigeria (ABV)" },
    { value: "PHC", label: "Port Harcourt (PHC)" },
    { value: "LHR", label: "London Heathrow, UK (LHR)" },
    { value: "DXB", label: "Dubai Int'l Airport, UAE (DXB)" },
    { value: "ZNZ", label: "Zanzibar Airport, Tanzania (ZNZ)" },
  ];

  // Sync state defaults when activeTab changes
  useEffect(() => {
    if (activeTab === 'flights') {
      setOrigin(flightOrigin);
      setDestination(flightDestination);
      setCabinClass(flightCabinClass);
    } else if (activeTab === 'hotels') {
      setOrigin('LOS');
      setDestination('2 Guests');
      setDate('2026-07-20');
      setCheckoutDate('2026-07-27');
      setCabinClass('5 Stars');
    } else if (activeTab === 'tours') {
      setOrigin('ZNZ');
      setDestination('6 Days');
      setCabinClass('VIP Guide');
    } else if (activeTab === 'cars') {
      setOrigin('LOS');
      setDestination('LOS');
      setCabinClass('sedan_executive');
    }
  }, [activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'flights') {
      if (tripType === 'multi-city') {
        onSearch({
          tab: activeTab,
          origin: multiCityFlights[0].origin,
          destination: multiCityFlights[0].destination,
          date: multiCityFlights[0].date,
          cabin: multiCityFlights[0].cabinClass,
        });
      } else {
        onSearch({
          tab: activeTab,
          origin: flightOrigin,
          destination: flightDestination,
          date: departureDate,
          cabin: flightCabinClass,
        });
      }
    } else {
      onSearch({
        tab: activeTab,
        origin,
        destination: activeTab === 'hotels' ? `${adultsCount + childrenCount + infantsCount} Guests` : destination,
        date,
        checkoutDate: activeTab === 'hotels' ? checkoutDate : undefined,
        cabin: cabinClass,
        hours: activeTab === 'cars' ? rentalHours : undefined,
      });
    }
  };

  // Dynamic values depending on activeTab
  const getTabConfig = () => {
    switch (activeTab) {
      case 'hotels':
        return {
          lbl1: "Hotel Location",
          lbl2: "Guest Capacity",
          lbl3: "Check-In Date",
          lbl4: "Lodging Tier",
          cta: "Check Hotel Options",
          options1: [
            { value: "LOS", label: "Lagos, Nigeria" },
            { value: "ABV", label: "Abuja, Nigeria" },
            { value: "ZNZ", label: "Zanzibar, Tanzania" },
          ],
          options2: [
            { value: "1 Guest", label: "1 Guest" },
            { value: "2 Guests", label: "2 Guests" },
            { value: "Family", label: "Family (3-5 Guests)" },
          ],
          options4: [
            { value: "3 Stars", label: "3 Stars Standard" },
            { value: "4 Stars", label: "4 Stars Premium" },
            { value: "5 Stars", label: "5 Stars Luxury" },
          ]
        };
      case 'tours':
        return {
          lbl1: "Adventure Region",
          lbl2: "Safari Duration",
          lbl3: "Preferred Start Date",
          lbl4: "Guidance Package",
          cta: "Check Packages",
          options1: [
            { value: "ZNZ", label: "Zanzibar Coastline" },
            { value: "DXB", label: "Dubai Classic Escapes" },
            { value: "SEY", label: "Seychelles Romantic Getaway" },
          ],
          options2: [
            { value: "5 Days", label: "5 Days, 4 Nights" },
            { value: "6 Days", label: "6 Days, 5 Nights" },
            { value: "7 Days", label: "7 Days, 6 Nights" },
          ],
          options4: [
            { value: "Standard", label: "Standard Group Tour" },
            { value: "Premium Guide", label: "Premium Tour Guide" },
            { value: "VIP Guide", label: "VIP Private Safari" },
          ]
        };
      case 'cars':
        return {
          lbl1: "Pick-Up Point",
          lbl2: "Drop-Off Point",
          lbl3: "Rental Date",
          lbl4: "Vehicle Category",
          cta: "Check Add-on Options",
          options1: [
            { value: "LOS", label: "Lagos Int'l Airport (LOS)" },
            { value: "ABV", label: "Abuja Int'l Airport (ABV)" },
            { value: "VI", label: "Victoria Island Center" },
          ],
          options2: [
            { value: "LOS", label: "Return to Pick-Up Point" },
            { value: "ABV", label: "Abuja Airport (ABV)" },
            { value: "VI", label: "Victoria Island Center" },
          ],
          options4: [
            { value: "sedan_executive", label: "Sedan Executive" },
            { value: "suv_executive", label: "SUV Executive" },
            { value: "sedan_normal", label: "Sedan Normal" },
            { value: "suv_normal", label: "SUV Normal" },
            { value: "coaster", label: "Coaster" },
            { value: "others", label: "Others" },
          ]
        };
      case 'flights':
      default:
        return {
          lbl1: "Departure City",
          lbl2: "Arrival Destination",
          lbl3: "Departure Date",
          lbl4: "Cabin Selections",
          cta: "Check Flight Offers",
          options1: [
            { value: "LOS", label: "Lagos, Nigeria (LOS)" },
            { value: "ABV", label: "Abuja, Nigeria (ABV)" },
            { value: "PHC", label: "Port Harcourt (PHC)" },
            { value: "LHR", label: "London Heathrow, UK (LHR)" },
            { value: "DXB", label: "Dubai Int'l Airport, UAE (DXB)" },
          ],
          options2: [
            { value: "ABV", label: "Abuja, Nigeria (ABV)" },
            { value: "LOS", label: "Lagos, Nigeria (LOS)" },
            { value: "LHR", label: "London Heathrow, UK (LHR)" },
            { value: "DXB", label: "Dubai Int'l Airport, UAE (DXB)" },
            { value: "ZNZ", label: "Zanzibar Airport, Tanzania (ZNZ)" },
          ],
          options4: [
            { value: "Economy", label: "Economy Cabin Class" },
            { value: "Premium", label: "Premium Economy" },
            { value: "Business", label: "Business Cabin Class" },
            { value: "First", label: "First Cabin Class" },
          ]
        };
    }
  };

  const config = getTabConfig();

  return (
    <div id="booking-engine" className="w-full mt-12 bg-white rounded-3xl p-4 md:p-6 shadow-xl border border-purple-100 text-left scroll-mt-70">

      {/* Module Tabs navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-purple-50 pb-5 search-tabs-grid">
        <button
          type="button"
          onClick={() => onSwitchTab('flights')}
          className={`flex items-center space-x-2 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'flights'
            ? ' shadow-lg shadow-[#4C1D5C]/10'
            : 'text-slate-500 '
            }`}
        >
          <span>✈️</span> <span>Flights</span>
        </button>
        <button
          type="button"
          onClick={() => onSwitchTab('hotels')}
          className={`flex items-center space-x-2 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'hotels'
            ? ' shadow-lg shadow-[#4C1D5C]/10'
            : 'text-slate-500 hover:text-brand-purple hover:bg-purple-50'
            }`}
        >
          <span>🏨</span> <span>Hotels</span>
        </button>
        <Link
          href="/packages"
          className={`flex items-center space-x-2 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'tours'
            ? ' shadow-lg shadow-[#4C1D5C]/10'
            : 'text-slate-500 hover:text-brand-purple hover:bg-purple-50'
            }`}
        >
          <span>🧳</span> <span>Packages</span>
        </Link>
        <button
          type="button"
          onClick={() => onSwitchTab('cars')}
          className={`flex items-center space-x-2 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'cars'
            ? 'shadow-lg shadow-[#4C1D5C]/10'
            : 'text-slate-500 hover:text-brand-purple hover:bg-purple-50'
            }`}
        >
          <span>🚗</span> <span>Car Rentals</span>
        </button>
      </div>

      {/* Simulated Search Inputs form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-left">

        {activeTab === 'flights' ? (
          <div className="flex flex-col space-y-5">
            {/* Sub-navigation Pills */}
            <div className="flex bg-purple-50/60 p-1 rounded-2xl w-fit border border-purple-100/40">
              {[
                { id: 'round-trip', label: 'Round trip' },
                { id: 'one-way', label: 'One way' },
                { id: 'multi-city', label: 'Multi-city' },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setTripType(type.id as any)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${tripType === type.id
                    ? 'bg-brand-purple text-white shadow-md shadow-[#4C1D5C]/20 border border-brand-purple/20'
                    : 'text-slate-500 hover:text-brand-purple hover:bg-purple-100/30'
                    }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {tripType === 'multi-city' ? (
              /* MULTI-CITY VIEW */
              <div className="space-y-4">
                {multiCityFlights.map((flight, idx) => (
                  <div key={idx} className="flex flex-col lg:flex-row items-stretch gap-4 bg-purple-50/10 p-5 rounded-3xl border border-purple-100/60 relative">

                    {/* Index Badge */}
                    <div className="flex items-center space-x-3 lg:space-x-0 shrink-0 self-center">
                      <div className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-black bg-purple-50 border border-purple-100 text-brand-purple">
                        {idx + 1}
                      </div>
                      <span className="lg:hidden text-xs font-black uppercase text-brand-purple">Flight {idx + 1}</span>
                    </div>

                    {/* FROM */}
                    <CustomSelect
                      id={`mc-origin-${idx}`}
                      label="FROM"
                      value={flight.origin}
                      options={flightAirports}
                      onChange={(val) => {
                        const newFlights = [...multiCityFlights];
                        newFlights[idx].origin = val;
                        setMultiCityFlights(newFlights);
                      }}
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                      }
                      className="flex-1 min-w-[200px]"
                    />

                    {/* SWAP BUTTON */}
                    <div className="flex items-center justify-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const newFlights = [...multiCityFlights];
                          const temp = newFlights[idx].origin;
                          newFlights[idx].origin = newFlights[idx].destination;
                          newFlights[idx].destination = temp;
                          setMultiCityFlights(newFlights);
                        }}
                        className="w-9 h-9 rounded-full border border-purple-100 bg-white flex items-center justify-center text-slate-500 hover:text-brand-orange hover:border-brand-orange hover:shadow-sm cursor-pointer transition-all"
                        title="Swap locations"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                        </svg>
                      </button>
                    </div>

                    {/* TO */}
                    <CustomSelect
                      id={`mc-destination-${idx}`}
                      label="TO"
                      value={flight.destination}
                      options={flightAirports}
                      onChange={(val) => {
                        const newFlights = [...multiCityFlights];
                        newFlights[idx].destination = val;
                        setMultiCityFlights(newFlights);
                      }}
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                      }
                      className=" min-w-[200px]"
                    />

                    {/* DEPART */}
                    <CustomDatePicker
                      id={`mc-date-${idx}`}
                      label="DEPART"
                      value={flight.date}
                      onChange={(val) => {
                        const newFlights = [...multiCityFlights];
                        newFlights[idx].date = val;
                        setMultiCityFlights(newFlights);
                      }}
                      className=" min-w-[150px]"
                      alignRight={true}
                    />

                    {/* CABIN CLASS */}
                    <CustomSelect
                      id={`mc-cabin-${idx}`}
                      label="Cabin class"
                      value={flight.cabinClass}
                      options={[
                        { value: "Economy", label: "Economy" },
                        { value: "Premium", label: "Premium" },
                        { value: "Business", label: "Business" },
                        { value: "First", label: "First" },
                      ]}
                      onChange={(val) => {
                        const newFlights = [...multiCityFlights];
                        newFlights[idx].cabinClass = val;
                        setMultiCityFlights(newFlights);
                      }}
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h14.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" />
                        </svg>
                      }
                      className="flex-1 min-w-[150px]"
                    />

                    {/* Delete flight button (only if > 2 flights) */}
                    {multiCityFlights.length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newFlights = multiCityFlights.filter((_, fIdx) => fIdx !== idx);
                          setMultiCityFlights(newFlights);
                        }}
                        className="absolute top-3 right-3 lg:relative lg:top-auto lg:right-auto self-center p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer shrink-0"
                        title="Remove Flight"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* ROUND-TRIP OR ONE-WAY VIEW */
              tripType === 'round-trip' ? (
                /* ROUND-TRIP VIEW (5 EQUAL COLUMNS) */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch relative">
                  {/* DESKTOP/TABLET SWAP BUTTON */}
                  <div className="absolute top-[38px] -translate-x-1/2 z-10 hidden md:block md:left-[50%] lg:left-[20%]">
                    <button
                      type="button"
                      onClick={() => {
                        const temp = flightOrigin;
                        setFlightOrigin(flightDestination);
                        setFlightDestination(temp);
                      }}
                      className="w-9 h-9 rounded-full border border-purple-100 bg-white flex items-center justify-center text-slate-500 hover:text-brand-orange hover:border-brand-orange hover:shadow-sm cursor-pointer transition-all"
                      title="Swap locations"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                      </svg>
                    </button>
                  </div>

                  <CustomSelect
                    id="flight-origin"
                    label="FROM"
                    value={flightOrigin}
                    options={flightAirports}
                    onChange={setFlightOrigin}
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                    }
                    className="md:col-span-1 lg:col-span-1"
                  />

                  {/* MOBILE SWAP BUTTON */}
                  <div className="flex items-center justify-center -my-3 md:hidden z-10">
                    <button
                      type="button"
                      onClick={() => {
                        const temp = flightOrigin;
                        setFlightOrigin(flightDestination);
                        setFlightDestination(temp);
                      }}
                      className="w-9 h-9 rounded-full border border-purple-100 bg-white flex items-center justify-center text-slate-500 hover:text-brand-orange hover:border-brand-orange hover:shadow-sm cursor-pointer transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                      </svg>
                    </button>
                  </div>

                  <CustomSelect
                    id="flight-destination"
                    label="TO"
                    value={flightDestination}
                    options={flightAirports}
                    onChange={setFlightDestination}
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                    }
                    className="md:col-span-1 lg:col-span-1"
                  />

                  <CustomDatePicker
                    id="flight-departure"
                    label="DEPARTURE"
                    value={departureDate}
                    onChange={setDepartureDate}
                    className="md:col-span-1 lg:col-span-1"
                  />

                  <CustomDatePicker
                    id="flight-return"
                    label="RETURN"
                    value={returnDate}
                    onChange={setReturnDate}
                    className="md:col-span-1 lg:col-span-1"
                    alignRight={true}
                  />

                  <TravellersSelect
                    adultsCount={adultsCount}
                    setAdultsCount={setAdultsCount}
                    childrenCount={childrenCount}
                    setChildrenCount={setChildrenCount}
                    infantsCount={infantsCount}
                    setInfantsCount={setInfantsCount}
                    className="md:col-span-2 lg:col-span-1"
                  />
                </div>
              ) : (
                /* ONE-WAY VIEW (4 EQUAL COLUMNS) */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch relative">
                  {/* DESKTOP/TABLET SWAP BUTTON */}
                  <div className="absolute top-[38px] -translate-x-1/2 z-10 hidden md:block md:left-[50%] lg:left-[25%]">
                    <button
                      type="button"
                      onClick={() => {
                        const temp = flightOrigin;
                        setFlightOrigin(flightDestination);
                        setFlightDestination(temp);
                      }}
                      className="w-9 h-9 rounded-full border border-purple-100 bg-white flex items-center justify-center text-slate-500 hover:text-brand-orange hover:border-brand-orange hover:shadow-sm cursor-pointer transition-all"
                      title="Swap locations"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                      </svg>
                    </button>
                  </div>

                  <CustomSelect
                    id="flight-origin"
                    label="FROM"
                    value={flightOrigin}
                    options={flightAirports}
                    onChange={setFlightOrigin}
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                    }
                    className="md:col-span-1 lg:col-span-1"
                  />

                  {/* MOBILE SWAP BUTTON */}
                  <div className="flex items-center justify-center -my-3 md:hidden z-10">
                    <button
                      type="button"
                      onClick={() => {
                        const temp = flightOrigin;
                        setFlightOrigin(flightDestination);
                        setFlightDestination(temp);
                      }}
                      className="w-9 h-9 rounded-full border border-purple-100 bg-white flex items-center justify-center text-slate-500 hover:text-brand-orange hover:border-brand-orange hover:shadow-sm cursor-pointer transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                      </svg>
                    </button>
                  </div>

                  <CustomSelect
                    id="flight-destination"
                    label="TO"
                    value={flightDestination}
                    options={flightAirports}
                    onChange={setFlightDestination}
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                    }
                    className="md:col-span-1 lg:col-span-1"
                  />

                  <CustomDatePicker
                    id="flight-departure"
                    label="DEPARTURE"
                    value={departureDate}
                    onChange={setDepartureDate}
                    className="md:col-span-1 lg:col-span-1"
                  />

                  <TravellersSelect
                    adultsCount={adultsCount}
                    setAdultsCount={setAdultsCount}
                    childrenCount={childrenCount}
                    setChildrenCount={setChildrenCount}
                    infantsCount={infantsCount}
                    setInfantsCount={setInfantsCount}
                    className="md:col-span-1 lg:col-span-1"
                  />
                </div>
              )
            )}

            {/* Bottom controllers */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-purple-50">

              {tripType === 'multi-city' && (
                <div>
                  {multiCityFlights.length < 6 && (
                    <button
                      type="button"
                      onClick={() => {
                        const lastFlight = multiCityFlights[multiCityFlights.length - 1];
                        setMultiCityFlights([
                          ...multiCityFlights,
                          {
                            origin: lastFlight.destination,
                            destination: lastFlight.destination === 'DXB' ? 'LOS' : 'DXB',
                            date: '2026-08-01',
                            cabinClass: 'Economy'
                          }
                        ]);
                      }}
                      className="flex items-center space-x-2 px-6 py-3.5 border border-dashed border-brand-purple/40 hover:border-brand-purple text-brand-purple hover:bg-purple-50 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <span>+ Add another flight</span>
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 ml-auto w-full sm:w-auto justify-end">
                {tripType === 'multi-city' && (
                  <TravellersSelect
                    adultsCount={adultsCount}
                    setAdultsCount={setAdultsCount}
                    childrenCount={childrenCount}
                    setChildrenCount={setChildrenCount}
                    infantsCount={infantsCount}
                    setInfantsCount={setInfantsCount}
                    className="w-56 text-left shrink-0 py-2.5"
                  />
                )}

                {tripType !== 'multi-city' && (
                  <CustomSelect
                    id="flight-cabin"
                    label="Cabin"
                    value={flightCabinClass}
                    options={[
                      { value: "Economy", label: "Economy" },
                      { value: "Premium", label: "Premium" },
                      { value: "Business", label: "Business" },
                      { value: "First", label: "First Class" },
                    ]}
                    onChange={setFlightCabinClass}
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h14.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" />
                      </svg>
                    }
                  />
                )}

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-brand-orange hover:bg-brand-purple text-white font-black px-12 py-4 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-[#FA6432]/10 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  Search flights
                </button>
              </div>

            </div>

          </div>
        ) : (
          /* STANDARD OTHER MODULES (Hotels, Packages, Car Rentals) */
          <>
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${activeTab === 'hotels' || activeTab === 'cars' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>

              {/* INPUT UNIT 1: Source / Region */}
              {activeTab === 'hotels' ? (
                <div className="custom-picker-container relative bg-purple-50/40 p-4 rounded-2xl border border-purple-100/60 hover:border-brand-orange focus-within:border-brand-orange transition-all duration-300 flex flex-col justify-center">
                  <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Hotel Location / Name</label>
                  <div className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Where are you staying?"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full bg-transparent text-brand-purple font-extrabold text-sm focus:outline-none placeholder:text-slate-400 border-none p-0 outline-none"
                    />
                  </div>
                </div>
              ) : (
                <CustomSelect
                  id="standard-origin"
                  label={config.lbl1}
                  value={origin}
                  options={config.options1}
                  onChange={setOrigin}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  }
                />
              )}

              {/* INPUT UNIT 2: Destination */}
              {activeTab === 'hotels' ? (
                <TravellersSelect
                  adultsCount={adultsCount}
                  setAdultsCount={setAdultsCount}
                  childrenCount={childrenCount}
                  setChildrenCount={setChildrenCount}
                  infantsCount={infantsCount}
                  setInfantsCount={setInfantsCount}
                />
              ) : (
                <CustomSelect
                  id="standard-destination"
                  label={config.lbl2}
                  value={destination}
                  options={config.options2}
                  onChange={setDestination}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  }
                />
              )}

              {/* INPUT UNIT 3: Calendars (Check-In) */}
              <CustomDatePicker
                id="standard-date"
                label={config.lbl3}
                value={date}
                onChange={setDate}
                alignRight={activeTab !== 'hotels'}
              />

              {/* INPUT UNIT 3B: Check-Out Date (Hotels only) */}
              {activeTab === 'hotels' && (
                <CustomDatePicker
                  id="hotel-checkout"
                  label="Check-Out Date"
                  value={checkoutDate}
                  onChange={setCheckoutDate}
                  alignRight={false}
                />
              )}
              
              {/* INPUT UNIT 3C: Rental Hours (Cars only) */}
              {activeTab === 'cars' && (
                <div className="custom-picker-container relative bg-purple-50/40 p-4 rounded-2xl border border-purple-100/60 hover:border-brand-orange focus-within:border-brand-orange transition-all duration-300 flex flex-col justify-center">
                  <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Rental Duration (Hours)</label>
                  <div className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <select
                      value={rentalHours}
                      onChange={(e) => setRentalHours(Number(e.target.value))}
                      className="bg-transparent text-brand-purple font-extrabold text-sm focus:outline-none border-none p-0 outline-none cursor-pointer pr-1"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12, 24].map((hr) => (
                        <option key={hr} value={hr}>{hr} hr{hr > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                    <span className="text-slate-300 text-xs">|</span>
                    <input
                      type="number"
                      min={1}
                      max={72}
                      value={rentalHours}
                      onChange={(e) => setRentalHours(Math.max(1, Number(e.target.value)))}
                      className="w-12 bg-transparent text-brand-purple font-extrabold text-sm focus:outline-none border-none p-0 outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              )}

              {/* INPUT UNIT 4: Selections classes */}
              <CustomSelect
                id="standard-cabin"
                label={config.lbl4}
                value={cabinClass}
                options={config.options4}
                onChange={setCabinClass}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h14.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" />
                  </svg>
                }
              />

            </div>

            {/* Bottom Action controllers */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-6 pt-5 border-t border-purple-50">
              <button
                type="submit"
                className="w-full sm:w-auto bg-brand-orange hover:bg-brand-purple text-white font-black px-12 py-4 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-[#FA6432]/10 transition-all hover:scale-[1.02] cursor-pointer"
              >
                {config.cta}
              </button>
            </div>
          </>
        )}

      </form>

    </div>
  );
}
