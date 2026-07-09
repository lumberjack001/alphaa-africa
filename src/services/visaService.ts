"use client";

import { apiFetch } from '@/lib/api';

export interface VisaCountry {
  id: number;
  name: string;
  slug: string;
  consultation_fee: string; // e.g. "5000.00"
  processing_time: string; // e.g. "4 to 6 weeks"
  flag_image: string; // URL
  is_featured: boolean;
}

export interface VisaCountryDetails extends VisaCountry {
  description: string;
}

export interface VisaApplyPayload {
  country_id: number;
  full_name: string;
  email: string;
  phone: string;
  travel_purpose: string;
  preferred_date: string; // YYYY-MM-DD
  num_applicants: number;
  message: string;
  callback_url?: string;
}

export interface VisaApplyResponse {
  application: {
    id: number;
    reference: string;
    status: 'paid' | 'pending' | 'failed';
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

export interface VisaVerifyResponse {
  reference: string;
  status: 'paid' | 'pending' | 'failed';
  full_name: string;
  email: string;
  phone: string;
  travel_purpose: string;
  preferred_date: string;
  num_applicants: number;
  message: string;
  country?: {
    id: number;
    name: string;
    slug: string;
  };
  [key: string]: any;
}

export const visaService = {
  async getAllCountries(): Promise<VisaCountry[]> {
    const data = await apiFetch<any>('/api/visa/countries/');
    return Array.isArray(data) ? data : (data.results || []);
  },

  async getCountryDetails(slug: string): Promise<VisaCountryDetails> {
    return apiFetch<VisaCountryDetails>(`/api/visa/countries/${slug}/`);
  },

  async applyVisa(payload: VisaApplyPayload): Promise<VisaApplyResponse> {
    return apiFetch<VisaApplyResponse>('/api/visa/apply/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async verifyPayment(reference: string): Promise<VisaVerifyResponse> {
    return apiFetch<VisaVerifyResponse>(`/api/visa/verify/${reference}/`);
  }
};
