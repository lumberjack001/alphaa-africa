"use client";

import { apiFetch } from '@/lib/api';

export interface AirportMatch {
  iata_code: string;
  name: string;
  city: string;
  country_name: string;
}

export interface MultiCityLegParam {
  origin: string;
  destination: string;
  date: string;
  cabin?: string;
}

export interface FlightSearchParams {
  trip_type?: 'one_way' | 'round_trip' | 'multi_city';
  legs?: MultiCityLegParam[];
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string | null;
  adults?: number;
  children?: number;
  infants?: number;
  travel_class?: string;
  non_stop?: boolean;
  max_stops?: number;
  currency?: string;
  max_offers?: number;
}

export interface FlightItinerarySegment {
  id?: string;
  departure?: { at: string; iataCode: string; terminal?: string };
  arrival?: { at: string; iataCode: string; terminal?: string };
  carrierCode?: string;
  number?: string;
  duration?: string;
  aircraft?: string;
  /** Segment-level departure airport code (simplified response format) */
  departure_airport?: string;
  /** Segment-level arrival airport code (simplified response format) */
  arrival_airport?: string;
  departure_time?: string;
  arrival_time?: string;
  carrier_code?: string;
  carrier_name?: string;
  flight_number?: string;
}

export interface FlightItinerary {
  duration: string;
  stops: number;
  segments: FlightItinerarySegment[];
}

export interface FlightOfferResult {
  offer_id: string;
  airline: string;
  airline_code: string;
  cabin: string;
  itineraries: FlightItinerary[];
  stops_per_itinerary?: number[];
  max_stops_in_trip?: number;
  is_direct?: boolean;
  seats_available: number;
  base_fare: string | number;
  markup: string | number;
  price: string | number;
  currency: string;
  raw_offer: any;
}

export interface FlightSearchResponse {
  count: number;
  trip_type?: string;
  is_local: boolean;
  currency: string;
  results: FlightOfferResult[];
}

export interface FlightTravelerInfo {
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  email?: string;
  phone_country_code?: string;
  phone?: string;
  passport_number?: string;
  passport_expiry?: string | null;
  nationality?: string;
  traveler_type?: string;
}

export interface CreateFlightBookingPayload {
  flight_offer: any;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  travelers: FlightTravelerInfo[];
}

export interface FlightBookingCreateResponse {
  booking?: {
    reference: string;
    status: string;
    total_amount: string;
    [key: string]: any;
  };
  payment?: {
    reference: string;
    authorization_url: string;
    access_code?: string;
    amount?: string;
  };
  [key: string]: any;
}

export interface FlightBookingVerifyResponse {
  reference?: string;
  pnr?: string;
  status: string;
  customer_email?: string;
  total_amount?: string;
  booking?: any;
  [key: string]: any;
}

export const flightService = {
  /**
   * Search airports by code (LOS), city (Lagos), or airport name (Murtala)
   */
  async searchAirports(query: string): Promise<AirportMatch[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const response = await apiFetch<AirportMatch[] | { results?: AirportMatch[] }>(
        `/api/flights/airports/?q=${encodeURIComponent(query.trim())}`
      );
      return Array.isArray(response) ? response : (response.results || []);
    } catch (error) {
      console.error("Error searching airports:", error);
      return [];
    }
  },

  /**
   * Search live flight offers
   */
  async searchFlights(params: FlightSearchParams): Promise<FlightSearchResponse> {
    const extractIata = (val: string): string => {
      if (!val) return 'LOS';
      const match = val.match(/\(([A-Z]{3})\)/i);
      if (match) return match[1].toUpperCase();
      const clean = val.trim().toUpperCase();
      if (clean.length === 3) return clean;
      if (clean.startsWith("LAGOS")) return "LOS";
      if (clean.startsWith("ABUJA")) return "ABV";
      if (clean.startsWith("PORT")) return "PHC";
      if (clean.startsWith("LONDON")) return "LHR";
      if (clean.startsWith("DUBAI")) return "DXB";
      if (clean.startsWith("ZANZIBAR")) return "ZNZ";
      return clean.substring(0, 3);
    };

    const sanitizeDate = (d?: string | null): string => {
      const today = new Date().toISOString().split('T')[0];
      if (!d || d < today) {
        const future = new Date();
        future.setDate(future.getDate() + 14);
        return future.toISOString().split('T')[0];
      }
      return d;
    };

    const formatTravelClass = (tc?: string): string => {
      if (!tc) return 'ECONOMY';
      const clean = tc.trim().toUpperCase().replace(/\s+/g, '_');
      if (clean.includes('PREMIUM')) return 'PREMIUM_ECONOMY';
      if (clean.includes('BUSINESS')) return 'BUSINESS';
      if (clean.includes('FIRST')) return 'FIRST';
      return 'ECONOMY';
    };

    let tripType = params.trip_type;

    // Safety: if multi_city declared but no legs, fall back to single-leg types
    if (tripType === 'multi_city' && (!params.legs || params.legs.length === 0)) {
      tripType = params.return_date ? 'round_trip' : 'one_way';
    }

    // Infer trip_type if not explicitly passed
    if (!tripType) {
      tripType = (params.legs && params.legs.length > 1)
        ? (params.return_date ? 'round_trip' : 'multi_city')
        : (params.return_date ? 'round_trip' : 'one_way');
    }

    const cabin = formatTravelClass(params.travel_class);
    const originCode = extractIata(params.origin);
    const destinationCode = extractIata(params.destination);
    const departureDate = sanitizeDate(params.departure_date);

    // Build legs array — ALL trip types now use legs, no top-level fields
    let legs: Array<{ origin: string; destination: string; date: string; cabin: string }>;

    if (tripType === 'multi_city' && params.legs && params.legs.length > 0) {
      // Multi-city: use provided legs, add cabin per leg
      legs = params.legs.map(leg => ({
        origin: extractIata(leg.origin),
        destination: extractIata(leg.destination),
        date: sanitizeDate(leg.date),
        cabin: leg.cabin ? formatTravelClass(leg.cabin) : cabin,
      }));
    } else if (tripType === 'round_trip' && params.return_date) {
      // Round-trip: leg 1 = outbound, leg 2 = return (reversed origin/destination)
      legs = [
        { origin: originCode, destination: destinationCode, date: departureDate, cabin },
        { origin: destinationCode, destination: originCode, date: sanitizeDate(params.return_date), cabin },
      ];
    } else {
      // One-way: single leg
      legs = [
        { origin: originCode, destination: destinationCode, date: departureDate, cabin },
      ];
      tripType = 'one_way';
    }

    const payload: any = {
      trip_type: tripType,
      legs,
      adults: params.adults || 1,
      currency: params.currency || 'NGN',
      max_offers: params.max_offers || 20,
    };

    if (params.children) payload.children = params.children;
    if (params.infants) payload.infants = params.infants;
    if (params.non_stop !== undefined) payload.non_stop = params.non_stop;
    if (params.max_stops !== undefined) payload.max_stops = params.max_stops;

    console.log("✈️ [Flight Search Payload]:", payload);

    const response = await apiFetch<FlightSearchResponse>(`/api/flights/search/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log("✈️ [Flight Search Response]:", response);
    return response;
  },

  /**
   * Re-validate flight offer price with Amadeus
   */
  async confirmPrice(flightOffer: any): Promise<any> {
    return apiFetch<any>(`/api/flights/price/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flight_offer: flightOffer })
    });
  },

  /**
   * Create flight booking & retrieve Paystack payment authorization URL
   */
  async createBooking(payload: CreateFlightBookingPayload): Promise<FlightBookingCreateResponse> {
    return apiFetch<FlightBookingCreateResponse>(`/api/flights/bookings/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  /**
   * Verify Paystack payment & create Amadeus airline PNR order
   */
  async verifyBooking(reference: string): Promise<FlightBookingVerifyResponse> {
    return apiFetch<FlightBookingVerifyResponse>(`/api/flights/bookings/verify/${encodeURIComponent(reference)}/`);
  }
};
