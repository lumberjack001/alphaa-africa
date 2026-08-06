"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  AIRPORT_REGISTRY
} from '../constants/mockData';
import { hotelService, type HotelCard, type HotelDetails } from '@/services/hotelService';
import { carService, type CarCard, type CarDetails } from '@/services/carService';
import { flightService, type FlightOfferResult } from '@/services/flightService';
import FlightListingCard from './FlightListingCard';
import HotelListingCard from './HotelListingCard';
import CarListingCard from './CarListingCard';
import AirlineDealsMatrix from './AirlineDealsMatrix';

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
  hours?: number;
  adults?: number;
  children?: number;
  infants?: number;
  tripType?: string;
  legs?: any[];
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
  guests = "1",
  stars = "5 Stars",
  onHotelClick,
  hours = 5,
  adults = 1,
  children = 0,
  infants = 0,
  tripType,
  legs,
}: ListingsProps) {
  const [hotels, setHotels] = useState<HotelCard[]>([]);
  const [fetchingHotels, setFetchingHotels] = useState(false);
  const [cars, setCars] = useState<CarCard[]>([]);
  const [fetchingCars, setFetchingCars] = useState(false);
  const [flights, setFlights] = useState<FlightOfferResult[]>([]);
  const [fetchingFlights, setFetchingFlights] = useState(false);

  // Flight matrix filter & sorting states
  const [selectedAirlineFilter, setSelectedAirlineFilter] = useState<string | null>(null);
  const [selectedStopsFilter, setSelectedStopsFilter] = useState<number | null>(null);
  const [flightSortBy, setFlightSortBy] = useState<'cheapest' | 'fastest' | 'earliest'>('cheapest');
  const [expandedAirlines, setExpandedAirlines] = useState<Record<string, boolean>>({});

  // Reset matrix filters when search params change
  useEffect(() => {
    setSelectedAirlineFilter(null);
    setSelectedStopsFilter(null);
    setExpandedAirlines({});
  }, [origin, destination, checkInDate, checkOutDate]);

  // Detail view state for modal (fallback when onHotelClick is not active)
  const [selectedHotel, setSelectedHotel] = useState<HotelDetails | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<any | null>(null);
  const [selectedCar, setSelectedCar] = useState<CarDetails | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // Load dynamic flights when tab is flights
  useEffect(() => {
    if (activeTab === 'flights' && isVisible && origin && destination) {
      const fetchFlightOffers = async () => {
        setFetchingFlights(true);
        try {
          const formattedTripType = (tripType as any) || (legs && legs.length > 0 ? 'multi_city' : checkOutDate ? 'round_trip' : 'one_way');

          const res = await flightService.searchFlights({
            origin: origin,
            destination: destination,
            departure_date: checkInDate || new Date().toISOString().split('T')[0],
            return_date: checkOutDate || null,
            travel_class: stars || "ECONOMY",
            trip_type: formattedTripType,
            legs: legs && legs.length > 0 ? legs : undefined,
            adults: adults,
            children: children,
            infants: infants,
          });
          setFlights(res.results || []);
        } catch (err) {
          console.error("Error fetching live flight offers:", err);
          setFlights([]);
        } finally {
          setFetchingFlights(false);
        }
      };
      fetchFlightOffers();
    }
  }, [activeTab, isVisible, origin, destination, checkInDate, checkOutDate, stars, adults, children, infants, tripType, JSON.stringify(legs)]);

  // Filter and sort flight offers
  const filteredAndSortedFlights = useMemo(() => {
    if (!flights || flights.length === 0) return [];

    let list = flights.filter(offer => {
      const code = offer.airline_code || offer.airline || 'FL';
      const stops = offer.max_stops_in_trip ?? offer.itineraries?.[0]?.stops ?? 0;

      if (selectedAirlineFilter && code !== selectedAirlineFilter) return false;
      if (selectedStopsFilter !== null) {
        if (selectedStopsFilter === 2 && stops < 2) return false;
        if (selectedStopsFilter < 2 && stops !== selectedStopsFilter) return false;
      }
      return true;
    });

    // Apply Quick-Sort
    list.sort((a, b) => {
      if (flightSortBy === 'cheapest') {
        return Number(a.price) - Number(b.price);
      }
      if (flightSortBy === 'fastest') {
        const durA = a.itineraries?.[0]?.duration || '99h';
        const durB = b.itineraries?.[0]?.duration || '99h';
        return durA.localeCompare(durB);
      }
      if (flightSortBy === 'earliest') {
        const depA = a.itineraries?.[0]?.segments?.[0]?.departure?.at || '';
        const depB = b.itineraries?.[0]?.segments?.[0]?.departure?.at || '';
        return depA.localeCompare(depB);
      }
      return 0;
    });

    return list;
  }, [flights, selectedAirlineFilter, selectedStopsFilter, flightSortBy]);

  // Group filtered flights by airline
  const groupedFlightsByAirline = useMemo(() => {
    const map = new Map<string, {
      airlineName: string;
      airlineCode: string;
      offers: FlightOfferResult[];
    }>();

    filteredAndSortedFlights.forEach(offer => {
      const code = offer.airline_code || offer.airline || 'FL';
      const name = offer.airline || 'Airline';
      if (!map.has(code)) {
        map.set(code, { airlineName: name, airlineCode: code, offers: [] });
      }
      map.get(code)!.offers.push(offer);
    });

    return Array.from(map.values());
  }, [filteredAndSortedFlights]);

  // Load dynamic hotels when tab is hotels
  useEffect(() => {
    if (activeTab === 'hotels' && isVisible) {
      const fetchList = async () => {
        setFetchingHotels(true);
        try {
          // Map origin codes (LOS -> Lagos, etc.)
          let queryDest = undefined;
          if (origin) {
            if (origin === 'LOS') queryDest = 'Lagos';
            else if (origin === 'ABV') queryDest = 'Abuja';
            else if (origin === 'ZNZ') queryDest = 'Zanzibar';
            else queryDest = origin;
          }

          let guestsVal = undefined;
          if (guests) {
            guestsVal = 2;
            if (guests.includes('1')) guestsVal = 1;
            else if (guests.toLowerCase().includes('family')) guestsVal = 4;
          }

          let minStarsVal = undefined;
          if (stars) {
            minStarsVal = 3;
            if (stars.includes('5')) minStarsVal = 5;
            else if (stars.includes('4')) minStarsVal = 4;
          }

          const results = await hotelService.searchHotels({
            destination: queryDest,
            guests: guestsVal,
            min_stars: minStarsVal,
            check_in: checkInDate || undefined,
            check_out: checkOutDate || undefined
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

  // Load dynamic cars when tab is cars
  useEffect(() => {
    if (activeTab === 'cars' && isVisible) {
      const fetchCars = async () => {
        setFetchingCars(true);
        try {
          const results = await carService.searchCars({
            vehicle_type: stars || undefined,
          });
          setCars(results);
        } catch (error) {
          console.error("API error fetching cars:", error);
          setCars([]);
        } finally {
          setFetchingCars(false);
        }
      };
      fetchCars();
    }
  }, [activeTab, isVisible, stars]);

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

  const handleOpenCarDetails = async (carCard: CarCard) => {
    setFetchingDetails(true);
    try {
      const slug = carCard.slug || carCard.id.toString();
      const data = await carService.getCarDetails(slug);
      setSelectedCar(data);
    } catch (e) {
      console.error("Could not fetch car details from API:", e);
      setSelectedCar(null);
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleSelectCarCard = (carCard: CarCard) => {
    handleOpenCarDetails(carCard);
  };

  const isLoading = propLoading || fetchingHotels || fetchingCars || fetchingFlights;

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
          {activeTab === 'flights' && (
            <div>
              {/* Best Deals by Airline Comparison Matrix */}
              <AirlineDealsMatrix
                offers={flights.map(f => ({
                  offer_id: f.offer_id,
                  airline: f.airline,
                  airline_code: f.airline_code,
                  price: Number(f.price),
                  itineraries: f.itineraries,
                }))}
                originCode={origin}
                destinationCode={destination}
                selectedAirline={selectedAirlineFilter}
                selectedStops={selectedStopsFilter}
                onFilterChange={(airline, stops) => {
                  setSelectedAirlineFilter(airline);
                  setSelectedStopsFilter(stops);
                }}
              />

              {/* Quick-Sort Bar & Matches Header */}
              {flights.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-purple-50/30 p-4 rounded-2xl border border-purple-100/60 font-sans">
                  <div className="text-xs">
                    <strong className="text-brand-purple font-black text-sm block">
                      {filteredAndSortedFlights.length} Flight{filteredAndSortedFlights.length !== 1 ? 's' : ''} Available
                    </strong>
                    <span className="text-slate-400 font-semibold">Sorted by {flightSortBy.toUpperCase()} • Live Amadeus Quotes</span>
                  </div>

                  <div className="flex items-center space-x-2 self-stretch sm:self-auto">
                    <span className="text-slate-400 text-xs font-bold shrink-0">Sort By:</span>
                    <div className="flex items-center bg-white p-1 rounded-xl border border-purple-100 shadow-xs">
                      <button
                        type="button"
                        onClick={() => setFlightSortBy('cheapest')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer border-none ${
                          flightSortBy === 'cheapest' ? 'bg-brand-purple text-white shadow-xs' : 'text-slate-500 hover:text-brand-purple'
                        }`}
                      >
                        Cheapest
                      </button>
                      <button
                        type="button"
                        onClick={() => setFlightSortBy('fastest')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer border-none ${
                          flightSortBy === 'fastest' ? 'bg-brand-purple text-white shadow-xs' : 'text-slate-500 hover:text-brand-purple'
                        }`}
                      >
                        Fastest
                      </button>
                      <button
                        type="button"
                        onClick={() => setFlightSortBy('earliest')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer border-none ${
                          flightSortBy === 'earliest' ? 'bg-brand-purple text-white shadow-xs' : 'text-slate-500 hover:text-brand-purple'
                        }`}
                      >
                        Earliest
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Grouped Airline Results Feed */}
              {filteredAndSortedFlights.length === 0 ? (
                <p className="text-center text-slate-400 font-bold py-12">
                  No active flight schedules match the selected filter criteria.
                </p>
              ) : (
                <div className="space-y-6">
                  {groupedFlightsByAirline.map(group => {
                    const heroOffer = group.offers[0];
                    const extraOffers = group.offers.slice(1);
                    const isExpanded = !!expandedAirlines[group.airlineCode];

                    const renderCard = (offer: FlightOfferResult) => {
                      const segs = offer.itineraries?.[0]?.segments || [];
                      const firstSeg = segs[0];
                      const lastSeg = segs[segs.length - 1];

                      return (
                        <FlightListingCard
                          key={offer.offer_id}
                          offer={offer}
                          originCode={firstSeg?.departure?.iataCode || origin}
                          destinationCode={lastSeg?.arrival?.iataCode || destination}
                          onBook={() => onBook({
                            type: 'flight',
                            name: offer.airline || 'Flight',
                            price: Number(offer.price) || 0,
                            payload: offer
                          })}
                        />
                      );
                    };

                    return (
                      <div key={group.airlineCode} className="space-y-3">
                        {/* Primary Best Fare Card per Airline */}
                        {renderCard(heroOffer)}

                        {/* Collapsible Accordion for Extra Flights */}
                        {extraOffers.length > 0 && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setExpandedAirlines(prev => ({ ...prev, [group.airlineCode]: !prev[group.airlineCode] }))}
                              className="w-full bg-purple-50/60 hover:bg-purple-100/60 border border-purple-100 text-brand-purple font-black text-xs py-3 px-4 rounded-2xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs font-sans"
                            >
                              <span>
                                {isExpanded
                                  ? `▲ Hide ${extraOffers.length} extra ${group.airlineName} flight${extraOffers.length > 1 ? 's' : ''}`
                                  : `▼ +${extraOffers.length} more ${group.airlineName} flight${extraOffers.length > 1 ? 's' : ''}`}
                              </span>
                            </button>

                            {isExpanded && (
                              <div className="mt-3 pl-2 border-l-2 border-purple-200 space-y-3 pt-1">
                                {extraOffers.map(offer => renderCard(offer))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

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
            (cars.length === 0 ? (
              <p className="text-center text-slate-400 font-bold py-12">No active vehicle hire options currently listed for this search criteria.</p>
            ) : (
              cars.map((car) => (
                <CarListingCard
                  key={car.id}
                  car={car}
                  onBook={(item) => onBook({
                    ...item,
                    payload: { ...item.payload, pickup_date: checkInDate, hours: hours }
                  })}
                  onSelect={handleSelectCarCard}
                />
              ))
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
      {/* Flight details are now expanded inline within each FlightListingCard */}
      {/* Car details selector modal */}
      {selectedCar && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-purple-100 shadow-2xl overflow-y-auto max-h-[90vh] text-left">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-50">
              <div>
                <span className="text-brand-orange text-[10px] uppercase font-black tracking-widest block font-sans">🚗 {selectedCar.vehicle_type_display}</span>
                <h3 className="text-2xl font-black text-brand-purple font-sans">{selectedCar.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCar(null)}
                className="text-slate-400 hover:text-brand-orange text-xl font-bold p-1 cursor-pointer border-none bg-transparent"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <img src={selectedCar.main_image} alt={selectedCar.name} className="w-full h-56 rounded-2xl object-cover border border-purple-100" />
                <div className="space-y-4 text-xs font-semibold text-slate-600">
                  <p className="leading-relaxed text-slate-500 font-normal">
                    {selectedCar.description || "Premium chauffeur vehicle hire with driver. Alphaa Africa certified security and routing standard."}
                  </p>
                  <div className="grid grid-cols-2 gap-4 bg-purple-50/30 p-4 rounded-xl border border-purple-100/50">
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[8px]">Capacity</span>
                      <strong className="text-slate-900 text-sm font-black">{selectedCar.capacity} Passengers</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[8px]">City</span>
                      <strong className="text-slate-900 text-sm font-black">{selectedCar.city}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-purple-50 space-y-3">
                  <h4 className="font-extrabold text-brand-purple text-xs uppercase tracking-wider">Vehicle Specifications</h4>
                  <ul className="text-xs space-y-2 font-semibold text-slate-600">
                    <li>🛡️ <span className="text-slate-400">Driver:</span> Certified professional included</li>
                    <li>⛽ <span className="text-slate-400">Fuel:</span> Full tank start option</li>
                    <li>❄️ <span className="text-slate-400">Air Conditioning:</span> Dual-zone climate control</li>
                    <li>🚭 <span className="text-slate-400">Policy:</span> Non-smoking cabin</li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-purple-50 space-y-3">
                  <h4 className="font-extrabold text-brand-purple text-xs uppercase tracking-wider">Features & Inclusions</h4>
                  <ul className="text-xs space-y-2 font-semibold text-slate-600">
                    <li>📶 <span className="text-slate-400">WiFi:</span> High-speed onboard WiFi</li>
                    <li>🥛 <span className="text-slate-400">Refreshments:</span> Cold water & newspapers</li>
                    <li>⚡ <span className="text-slate-400">Charging:</span> USB & type-C ports</li>
                    <li>🗺️ <span className="text-slate-400">Routing:</span> Live GPS route optimizations</li>
                  </ul>
                </div>
              </div>

              {/* Booking Actions */}
              <div className="border-t border-purple-50 pt-6 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Hourly price from</span>
                  <strong className="text-2xl font-black text-brand-purple">₦{Number(selectedCar.hourly_rate).toLocaleString()}/hr</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onBook({
                      type: 'vehicle',
                      name: selectedCar.name,
                      price: Number(selectedCar.hourly_rate),
                      payload: { vehicle_id: selectedCar.id, slug: selectedCar.slug, pickup_date: checkInDate, hours: hours }
                    });
                    setSelectedCar(null);
                  }}
                  className="bg-brand-orange hover:bg-brand-purple text-white font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer border-none shadow-md"
                >
                  Book Vehicle Hire
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
