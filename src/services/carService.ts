"use client";

import { apiFetch } from '@/lib/api';

export interface CarCard {
  id: number | string;
  name: string;
  slug: string;
  vehicle_type: 'sedan_executive' | 'suv_executive' | 'sedan_normal' | 'suv_normal' | 'coaster' | 'others';
  vehicle_type_display: string;
  hourly_rate: number | string;
  capacity: number | string;
  city: string;
  main_image: string;
}

export interface CarDetails extends CarCard {
  description: string;
}

export interface CarSearchParams {
  vehicle_type?: string;
  max_rate?: number;
  ordering?: string;
}

export interface CreateCarBookingPayload {
  vehicle_id: number;
  pickup_location: string;
  dropoff_location: string;
  pickup_datetime: string;
  num_hours: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  callback_url?: string;
}

export interface CarBookingResponse {
  booking: {
    id: number | string;
    reference: string;
    status: string;
    total_amount: string;
    pickup_location: string;
    dropoff_location: string;
    pickup_datetime: string;
    num_hours: number;
    [key: string]: any;
  };
  payment: {
    reference: string;
    authorization_url: string;
    access_code: string;
    amount: string;
  };
}

export interface CarBookingVerifyResponse {
  reference: string;
  status: 'confirmed' | 'pending' | 'failed';
  guest_name: string;
  total_amount: string;
  pickup_location: string;
  dropoff_location: string;
  num_hours: number;
  vehicle?: {
    name: string;
    vehicle_type_display: string;
  };
  [key: string]: any;
}

export const carService = {
  async searchCars(params: CarSearchParams): Promise<CarCard[]> {
    const query = new URLSearchParams();
    if (params.vehicle_type) query.set('vehicle_type', params.vehicle_type);
    if (params.max_rate) query.set('max_rate', params.max_rate.toString());
    if (params.ordering) query.set('ordering', params.ordering);

    const url = `/api/cars/?${query.toString()}`;
    const response = await apiFetch<any>(url);
    return Array.isArray(response) ? response : (response.results || []);
  },

  async getCarDetails(slug: string): Promise<CarDetails> {
    return apiFetch<CarDetails>(`/api/cars/${slug}/`);
  },

  async createBooking(payload: CreateCarBookingPayload): Promise<CarBookingResponse> {
    return apiFetch<CarBookingResponse>('/api/cars/bookings/create/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async verifyBooking(reference: string): Promise<CarBookingVerifyResponse> {
    return apiFetch<CarBookingVerifyResponse>(`/api/cars/bookings/verify/${reference}/`);
  }
};
