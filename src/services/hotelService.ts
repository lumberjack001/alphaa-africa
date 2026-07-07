"use client";

import { apiFetch } from '@/lib/api';

export interface HotelCard {
  id: number | string;
  name: string;
  slug: string;
  city: string;
  country: string;
  star_rating: number;
  main_image: string;
  amenities_list: string[];
  starting_price: number;
}

export interface RoomType {
  id: number;
  name: string;
  description: string;
  price_per_night: number;
  max_guests: number;
  total_rooms: number;
  image: string;
}

export interface HotelDetails extends HotelCard {
  description: string;
  gallery_images: string[];
  room_types: RoomType[];
}

export interface HotelSearchParams {
  destination?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  rooms?: number;
  min_stars?: number;
  max_price?: number;
  ordering?: string;
}

export interface CreateBookingPayload {
  hotel_id: number;
  room_type_id: number;
  check_in: string;
  check_out: string;
  num_rooms: number;
  num_guests: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  callback_url?: string;
}

export interface BookingResponse {
  booking: {
    reference: string;
    status: string;
    total_amount: string;
    [key: string]: any;
  };
  payment: {
    reference: string;
    authorization_url: string;
    access_code: string;
    amount: string;
  };
}

export interface BookingVerifyResponse {
  reference: string;
  status: 'confirmed' | 'pending' | 'failed';
  guest_name: string;
  total_amount: string;
  [key: string]: any;
}

export const hotelService = {
  async searchHotels(params: HotelSearchParams): Promise<HotelCard[]> {
    const query = new URLSearchParams();
    if (params.destination) query.set('destination', params.destination);
    if (params.check_in) query.set('check_in', params.check_in);
    if (params.check_out) query.set('check_out', params.check_out);
    if (params.guests) query.set('guests', params.guests.toString());
    if (params.rooms) query.set('rooms', params.rooms.toString());
    if (params.min_stars) query.set('min_stars', params.min_stars.toString());
    if (params.max_price) query.set('max_price', params.max_price.toString());
    if (params.ordering) query.set('ordering', params.ordering);

    const url = `/api/hotels/?${query.toString()}`;
    const response = await apiFetch<any>(url);
    return Array.isArray(response) ? response : (response.results || []);
  },

  async getHotelDetails(slug: string): Promise<HotelDetails> {
    return apiFetch<HotelDetails>(`/api/hotels/${slug}/`);
  },

  async createBooking(payload: CreateBookingPayload): Promise<BookingResponse> {
    return apiFetch<BookingResponse>('/api/hotels/bookings/create/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async verifyBooking(reference: string): Promise<BookingVerifyResponse> {
    return apiFetch<BookingVerifyResponse>(`/api/hotels/bookings/verify/${reference}/`);
  }
};
