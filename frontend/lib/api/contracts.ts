export interface SearchFilters {
  location?: string;
  propertyType: PropertyType;
  minPrice: number;
  maxPrice: number;
  bedrooms: BedroomCount;
}

export type PropertyType =
  | 'any'
  | 'self_contain'
  | 'room_and_parlour'
  | 'single_room'
  | 'bq'
  | 'short_let'
  | 'flat'
  | 'maisonette'
  | 'bungalow'
  | 'terrace_duplex'
  | 'semi_detached_duplex'
  | 'fully_detached_duplex'
  | 'penthouse'
  | 'mansion'
  | 'land'
  | 'commercial';

export type BedroomCount = 'any' | '1' | '2' | '3' | '4' | '5';

export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  propertyType: PropertyType;
  price: number;
  currency: 'NGN';
  isNegotiable: boolean;
  address: string;
  city: string;
  state: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  isServiced: boolean;
  isFurnished: boolean;
  status: 'available' | 'under_contract' | 'rented' | 'sold';
  isFeatured: boolean;
  images: PropertyImage[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertyImage {
  id: string;
  imageUrl: string;
  caption?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface SearchResponse extends PaginatedResponse<Property> {}

export interface ConciergeLeadRequest {
  fullName: string;
  phone: string;
  email?: string;
  preferredLocation: string;
  propertyType: PropertyType;
  budgetMin: number;
  budgetMax: number;
  bedrooms: BedroomCount;
  ndprConsent: true;
}

export interface ConciergeLeadResponse {
  success: true;
  message: string;
  data: {
    id: string;
    status: 'active_sla_queue' | 'assigned' | 'contacted' | 'closed_won' | 'closed_lost';
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface NDPRConsentLog {
  id: string;
  leadId: string;
  ipAddress: string;
  userAgent: string;
  consentText: string;
  createdAt: string;
}

export const API_VERSION = 'v1';
export const API_BASE_PATH = `/api/${API_VERSION}`;