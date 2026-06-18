export interface FlightOffer {
  id: string;
  carrier: string;
  number: string;
  from: string;
  to: string;
  dep: string;
  arr: string;
  duration: string;
  stops: string;
  price: number;
  logo: string;
}

export interface HotelOffer {
  id: string;
  name: string;
  location: string;
  rating: string;
  price: number;
  image: string;
}

export interface CarOffer {
  id: string;
  name: string;
  desc: string;
  price: number;
  image: string;
}

export const AIRPORT_REGISTRY = [
  { code: 'LOS', city: 'Lagos', name: "Murtala Muhammed Int'l" },
  { code: 'ABV', city: 'Abuja', name: "Nnamdi Azikiwe Int'l" },
  { code: 'PHC', city: 'Port Harcourt', name: "Port Harcourt Int'l" },
  { code: 'LHR', city: 'London', name: 'Heathrow Airport' },
  { code: 'DXB', city: 'Dubai', name: 'Dubai International' },
  { code: 'ZNZ', city: 'Zanzibar', name: 'Abeid Amani Karume Int\'l' }
];

export const AIR_OFFERS_MOCK: FlightOffer[] = [
  { id: 'FL-001', carrier: 'Air Peace', number: 'P4-LOS90', from: 'LOS', to: 'ABV', dep: '08:30 AM', arr: '09:45 AM', duration: '1h 15m', stops: 'Direct', price: 120000, logo: '✈️' },
  { id: 'FL-002', carrier: 'Africa World Airlines', number: 'AW-ACC71', from: 'LOS', to: 'LHR', dep: '10:00 AM', arr: '04:45 PM', duration: '6h 45m', stops: 'Direct', price: 1250000, logo: '🦁' },
  { id: 'FL-003', carrier: 'Qatar Airways', number: 'QR-DXB12', from: 'LOS', to: 'DXB', dep: '01:15 PM', arr: '10:45 PM', duration: '7h 30m', stops: '1 Stop', price: 980000, logo: '🇶🇦' }
];

export const HOTEL_OFFERS_MOCK: HotelOffer[] = [
  { id: 'HT-101', name: 'Radisson Blu Anchorage Hotel', location: 'Victoria Island, Lagos', rating: '5 Stars', price: 240000, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80' },
  { id: 'HT-102', name: 'Transcorp Hilton Abuja', location: 'Maitama, Abuja', rating: '5 Stars', price: 310000, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80' }
];

export const CAR_OFFERS_MOCK: CarOffer[] = [
  { id: 'CR-201', name: 'Toyota Land Cruiser Prado', desc: 'Automatic • Professional Chauffeur Included', price: 85000, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80' },
  { id: 'CR-202', name: 'Hyundai Elantra Luxury', desc: 'Automatic • Self-Drive or Driver Options', price: 45000, image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80' }
];
