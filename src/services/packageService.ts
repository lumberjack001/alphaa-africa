"use client";

import { apiFetch } from '@/lib/api';

export interface Destination {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface Package {
  id: number;
  name: string;
  slug: string;
  description: string;
  main_image: string;
  price: number;
  duration_days: number;
}

export interface PackageDetails extends Package {
  gallery_images: string[];
  itinerary: string;
  included_amenities: string[];
}

export interface EnquiryPayload {
  full_name: string;
  email: string;
  phone: string;
  preferred_date: string;
  num_adults: number;
  num_children: number;
  message: string;
}

export const packageService = {
  async getDestinations(): Promise<Destination[]> {
    return apiFetch<Destination[]>('/api/packages/destinations/');
  },

  async getPackages(destinationSlug: string): Promise<Package[]> {
    return apiFetch<Package[]>(`/api/packages/destinations/${destinationSlug}/`);
  },

  async getPackageDetails(slug: string): Promise<PackageDetails> {
    return apiFetch<PackageDetails>(`/api/packages/${slug}/`);
  },

  async submitEnquiry(slug: string, payload: EnquiryPayload): Promise<void> {
    await apiFetch(`/api/packages/${slug}/enquire/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};
