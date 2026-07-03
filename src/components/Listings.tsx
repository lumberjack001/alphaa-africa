"use client";

import React, { useState, useEffect } from 'react';
import {
  AIR_OFFERS_MOCK,
  CAR_OFFERS_MOCK,
  AIRPORT_REGISTRY
} from '../constants/mockData';
import { hotelService, type HotelCard, type HotelDetails } from '@/services/hotelService';
import FlightListingCard from './FlightListingCard';
import HotelListingCard from './HotelListingCard';
import CarListingCard from './CarListingCard';

interface ListingsProps {
  activeTab: string;
  isVisible: boolean;
  isLoading: boolean;
  onReset: () => void;
  onBook: (item: { type: string; name: string; price: number; payload?: any }) => void;
  origin: string;
  destination: string;
  checkInDate?: string;
  checkOutDate?: string;
  guests?: string;
  stars?: string;
  onHotelClick?: (slug: string) => void;
}

export default function Listings({
  activeTab,
  isVisible,
  isLoading: propLoading,
  onReset,
  onBook,
  origin,
  destination,
  checkInDate,
  checkOutDate,
  guests,
  stars,
  onHotelClick
}: ListingsProps) {
  const [hotels, setHotels] = useState<HotelCard[]>([]);
  const [fetchingHotels, setFetchingHotels] = useState(false);

  // Detail view state for modal (fallback when onHotelClick is not active)
  const [selectedHotel, setSelectedHotel] = useState<HotelDetails | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<any | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // Load dynamic hotels when tab is hotels
  useEffect(() => {
    if (activeTab === 'hotels' && isVisible) {
      const fetchList = async () => {
        setFetchingHotels(true);
        try {
          // Map origin codes (LOS -> Lagos, etc.)
          let queryDest = origin;
          if (origin === 'LOS') queryDest = 'Lagos';
          else if (origin === 'ABV') queryDest = 'Abuja';
          else if (origin === 'ZNZ') queryDest = 'Zanzibar';

          let guestsVal = 2;
          if (guests) {
            if (guests.includes('1')) guestsVal = 1;
            else if (guests.toLowerCase().includes('family')) guestsVal = 4;
          }

          let minStarsVal = 3;
          if (stars) {
            if (stars.includes('5')) minStarsVal = 5;
            else if (stars.includes('4')) minStarsVal = 4;
          }

          const results = await hotelService.searchHotels({
            destination: queryDest,
            guests: guestsVal,
            min_stars: minStarsVal,
            check_in: checkInDate,
            check_out: checkOutDate
          });
          setHotels(results);
        } catch (error) {
          console.error("API error fetching hotels:", error);
          setHotels([]); // fallback will take place below
        } finally {
          setFetchingHotels(false);
        }
      };
      fetchList();
    }
  }, [activeTab, isVisible, origin, checkInDate, checkOutDate, guests, stars]);

  if (!isVisible) return null;

  const getCityName = (code: string) => {
    const registry = AIRPORT_REGISTRY.find(item => item.code === code);
    return registry ? registry.city : code;
  };

  const originName = getCityName(origin);
  const destinationName = getCityName(destination);

  // Live active hotels from backend
  const activeHotels: HotelCard[] = hotels;

  const handleOpenHotelDetails = async (hotelCard: HotelCard) => {
    setFetchingDetails(true);
    try {
      const slug = hotelCard.slug || hotelCard.id.toString();
      const data = await hotelService.getHotelDetails(slug);
      setSelectedHotel(data);
    } catch (e) {
      console.error("Could not fetch hotel details from API:", e);
      setSelectedHotel(null);
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleSelectHotelCard = (hotelCard: HotelCard) => {
    if (onHotelClick) {
      onHotelClick(hotelCard.slug || hotelCard.id.toString());
    } else {
      handleOpenHotelDetails(hotelCard);
    }
  };

  const isLoading = propLoading || fetchingHotels;

  return (
    <section id="listings-viewports" className="max-w-7xl mx-auto py-12 px-4 sm:px-8 text-left relative">
      
      {/* Top listings navigation metadata */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-purple-100">
        <div>
          <span className="text-xs text-brand-orange font-black uppercase tracking-wider block mb-1">Available Matches</span>
          <h3 className="text-xl sm:text-2xl font-black text-brand-purple uppercase tracking-tight font-sans">Active Provider Quotes</h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-bold text-slate-400 hover:text-brand-orange underline cursor-pointer"
        >
          Reset Search Filters
        </button>
      </div>

      {/* Live simulated loader animation skeleton */}
      {isLoading ? (
        <div id="loading-gds-skeleton" className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-purple-50 animate-pulse flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-slate-100 rounded"></div>
                  <div className="w-16 h-3 bg-slate-50 rounded"></div>
                </div>
              </div>
              <div className="w-48 h-8 bg-slate-50 rounded"></div>
              <div className="w-32 h-10 bg-slate-100 rounded-2xl"></div>
            </div>
          ))}
        </div>
      ) : (
        <div id="aggregator-matches-grid" className="space-y-4">
          
          {/* Flight Listings */}
          {activeTab === 'flights' &&
            AIR_OFFERS_MOCK.map((flight) => (
              <FlightListingCard
                key={flight.id}
                flight={flight}
                originName={originName}
                destinationName={destinationName}
                onBook={onBook}
                onSelect={setSelectedFlight}
              />
            ))}

          {/* Hotel Listings */}
          {activeTab === 'hotels' &&
            (activeHotels.length === 0 ? (
              <p className="text-center text-slate-400 font-bold py-12">No active hotel accommodations currently listed for this search criteria.</p>
            ) : (
              activeHotels.map((hotel) => (
                <HotelListingCard
                  key={hotel.id}
                  hotel={hotel}
                  fetchingDetails={fetchingDetails}
                  onSelect={handleSelectHotelCard}
                  hasClickRouter={!!onHotelClick}
                />
              ))
            ))}

          {/* Vehicle Hire Listings */}
          {activeTab === 'cars' &&
            CAR_OFFERS_MOCK.map((car) => (
              <CarListingCard
                key={car.id}
                car={car}
                onBook={onBook}
              />
            ))}

        </div>
      )}

      {/* Hotel Room Type details selector modal */}
      {selectedHotel && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-purple-100 shadow-2xl overflow-y-auto max-h-[90vh] text-left">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-50">
              <div>
                <span className="text-brand-orange text-[10px] uppercase font-black tracking-widest block font-sans">📍 {selectedHotel.city}, {selectedHotel.country}</span>
                <h3 className="text-2xl font-black text-brand-purple font-sans">{selectedHotel.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHotel(null)}
                className="text-slate-400 hover:text-brand-orange text-xl font-bold p-1 cursor-pointer border-none bg-transparent"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <img src={selectedHotel.main_image} alt={selectedHotel.name} className="w-full h-56 rounded-2xl object-cover border border-purple-100" />
              <div className="space-y-4 text-xs font-semibold text-slate-600">
                <p className="leading-relaxed text-slate-500 font-normal">
                  {selectedHotel.description}
                </p>
                <div>
                  <h5 className="font-extrabold text-brand-purple mb-1 text-sm">Amenities included:</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedHotel.amenities_list?.map((amenity: string, idx: number) => (
                      <span key={idx} className="bg-purple-50 text-[10px] text-brand-purple px-3 py-1 rounded-lg">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-extrabold text-brand-purple text-base mb-4 uppercase tracking-wider font-sans">Select Accomodation Variant</h4>
              <div className="space-y-4">
                {selectedHotel.room_types?.map((room: any) => (
                  <div key={room.id} className="border border-purple-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-purple-50/10 hover:bg-purple-50/20 transition-all">
                    <div className="flex items-center space-x-4 self-start sm:self-center">
                      {room.image && <img src={room.image} alt={room.name} className="w-16 h-16 rounded-xl object-cover border border-purple-100" />}
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm leading-tight">{room.name}</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-normal max-w-md">{room.description}</p>
                        <span className="text-[10px] text-brand-orange font-bold mt-1 block">Max capacity: {room.max_guests} Guests</span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-purple-50">
                      <div>
                        <span className="text-[9px] text-slate-400 block sm:text-right">Price / Night</span>
                        <strong className="text-base font-black text-brand-purple">₦{Number(room.price_per_night).toLocaleString()}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          let guestsVal = 2;
                          if (guests) {
                            if (guests.includes('1')) guestsVal = 1;
                            else if (guests.toLowerCase().includes('family')) guestsVal = 4;
                          }
                          onBook({
                            type: 'hotel',
                            name: `${selectedHotel.name} - ${room.name}`,
                            price: room.price_per_night,
                            payload: {
                              hotel_id: selectedHotel.id,
                              room_type_id: room.id,
                              check_in: checkInDate || '2026-07-20',
                              check_out: checkOutDate || '2026-07-27',
                              num_guests: guestsVal,
                            }
                          });
                          setSelectedHotel(null);
                        }}
                        className="bg-brand-orange hover:bg-brand-purple text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer border-none"
                      >
                        Reserve Room
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Flight details selector modal */}
      {selectedFlight && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-purple-100 shadow-2xl overflow-y-auto max-h-[90vh] text-left">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-50">
              <div>
                <span className="text-brand-orange text-[10px] uppercase font-black tracking-widest block font-sans">✈️ Flight Information</span>
                <h3 className="text-2xl font-black text-brand-purple font-sans">{selectedFlight.carrier} • {selectedFlight.number}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFlight(null)}
                className="text-slate-400 hover:text-brand-orange text-xl font-bold p-1 cursor-pointer border-none bg-transparent"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Flight itinerary visualization */}
              <div className="bg-purple-50/20 border border-purple-100/40 rounded-2xl p-6 flex justify-between items-center gap-4">
                <div className="text-left">
                  <strong className="text-2xl font-black text-brand-purple block leading-none">{selectedFlight.dep}</strong>
                  <span className="text-xs text-slate-500 font-bold uppercase mt-1.5 block">{originName}</span>
                </div>
                
                <div className="flex-1 flex flex-col items-center px-4">
                  <span className="text-[10px] text-slate-400 font-semibold">{selectedFlight.duration}</span>
                  <div className="w-full h-0.5 bg-brand-orange/30 my-2 relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-orange absolute top-1/2 left-1/2 -translate-y-1/2"></div>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{selectedFlight.stops}</span>
                </div>

                <div className="text-right">
                  <strong className="text-2xl font-black text-brand-purple block leading-none">{selectedFlight.arr}</strong>
                  <span className="text-xs text-slate-500 font-bold uppercase mt-1.5 block">{destinationName}</span>
                </div>
              </div>

              {/* Detailed specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-purple-50 space-y-3">
                  <h4 className="font-extrabold text-brand-purple text-xs uppercase tracking-wider">Flight Specifications</h4>
                  <ul className="text-xs space-y-2 font-semibold text-slate-600">
                    <li>✈️ <span className="text-slate-400">Aircraft:</span> Boeing 787-9 / E195-E2</li>
                    <li>🛋️ <span className="text-slate-400">Cabin Class:</span> Standard Economy</li>
                    <li>📏 <span className="text-slate-400">Seat Pitch:</span> 32 inches (Standard)</li>
                    <li>🔄 <span className="text-slate-400">Refund Policy:</span> Changeable with fee</li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-purple-50 space-y-3">
                  <h4 className="font-extrabold text-brand-purple text-xs uppercase tracking-wider">Baggage & Amenities</h4>
                  <ul className="text-xs space-y-2 font-semibold text-slate-600">
                    <li>🧳 <span className="text-slate-400">Checked:</span> 2x 23kg Bags Included</li>
                    <li>🎒 <span className="text-slate-400">Carry-on:</span> 1x 7kg Bag Included</li>
                    <li>📶 <span className="text-slate-400">Onboard WiFi:</span> High-speed (paid)</li>
                    <li>🍔 <span className="text-slate-400">Catering:</span> Hot meals & beverages</li>
                  </ul>
                </div>
              </div>

              {/* Booking Actions */}
              <div className="border-t border-purple-50 pt-6 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Total price from</span>
                  <strong className="text-2xl font-black text-brand-purple">₦{selectedFlight.price.toLocaleString()}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onBook({ type: 'flight', name: selectedFlight.carrier, price: selectedFlight.price });
                    setSelectedFlight(null);
                  }}
                  className="bg-brand-orange hover:bg-brand-purple text-white font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer border-none shadow-md"
                >
                  Book E-Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
