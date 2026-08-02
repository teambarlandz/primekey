import { ConciergeFormValues } from "@/lib/validations/conciergeSchema";
import { LandlordRegistrationValues } from "@/lib/validations/landlordSchema";
import { SearchFilterValues } from "@/lib/validations/searchSchema";

/**
 * Snake_case payload expected by the DRF backend for landlord registration.
 * Produced by mapLandlordValuesToPayload in landlordSchema.
 */
export type LandlordRegistrationPayload = {
  full_name: string;
  phone: string;
  email: string | null;
  id_type: LandlordRegistrationValues["idType"];
  id_number: string;
  property_count: number;
  ndpr_consent: boolean;
};

// Ensures base URL cleanly handles trailing slashes
const BASE_URL_RAW = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const API_BASE_URL = BASE_URL_RAW.replace(/\/+$/, "");

export interface ApiSuccessResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export class ApiClientError extends Error {
  public status: number;
  public errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Submit 2-Week Concierge lead payload to Django REST Framework backend.
 */
export async function submitConciergeLead(
  formData: ConciergeFormValues
): Promise<ApiSuccessResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/crm/submit-concierge/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email || null,
        preferred_location: formData.preferredLocation,
        property_type: formData.propertyType || "any",
        budget_min: formData.budgetMin ?? 0,
        budget_max: formData.budgetMax ?? 500000000,
        bedrooms: String(formData.bedrooms ?? "any"),
        ndpr_consent: formData.ndprConsent,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // Extract DRF field validation errors or detail message
      const errorMessage =
        data?.message ||
        data?.detail ||
        (typeof data?.errors === "object" && data?.errors !== null
          ? Object.entries(data.errors)
              .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
              .join(" | ")
          : "Failed to submit concierge request. Please try again.");

      throw new ApiClientError(errorMessage, response.status, data?.errors);
    }

    return data as ApiSuccessResponse;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    throw new ApiClientError(
      "Unable to connect to Primekey server. Please check your network connection.",
      0
    );
  }
}

/**
 * Submit Landlord Registration payload to Django REST Framework backend.
 */
export async function submitLandlordRegistration(
  payload: LandlordRegistrationPayload
): Promise<ApiSuccessResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/landlords/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        data?.message ||
        data?.detail ||
        (typeof data?.errors === "object" && data?.errors !== null
          ? Object.entries(data.errors)
              .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
              .join(" | ")
          : "Failed to submit landlord registration. Please try again.");

      throw new ApiClientError(errorMessage, response.status, data?.errors);
    }

    return data as ApiSuccessResponse;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    throw new ApiClientError(
      "Unable to connect to Primekey server. Please check your network connection.",
      0
    );
  }
}

/**
 * Send OTP code to phone number
 */
export async function submitOTP(
  phone: string,
  purpose: 'login' | 'register' | 'password_reset' = 'login'
): Promise<ApiSuccessResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/otp/send/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ phone, purpose }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        data?.message ||
        data?.detail ||
        (typeof data?.errors === "object" && data?.errors !== null
          ? Object.entries(data.errors)
              .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
              .join(" | ")
          : "Failed to send OTP. Please try again.");

      throw new ApiClientError(errorMessage, response.status, data?.errors);
    }

    return data as ApiSuccessResponse;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    throw new ApiClientError(
      "Unable to connect to Primekey server. Please check your network connection.",
      0
    );
  }
}

/**
 * Verify OTP code and get JWT tokens
 */
export async function verifyOTP(
  phone: string,
  code: string,
  purpose: 'login' | 'register' | 'password_reset' = 'login'
): Promise<ApiSuccessResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/otp/verify/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ phone, code, purpose }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        data?.message ||
        data?.detail ||
        (typeof data?.errors === "object" && data?.errors !== null
          ? Object.entries(data.errors)
              .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
              .join(" | ")
          : "Invalid OTP code. Please try again.");

      throw new ApiClientError(errorMessage, response.status, data?.errors);
    }

    return data as ApiSuccessResponse;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    throw new ApiClientError(
      "Unable to connect to Primekey server. Please check your network connection.",
      0
    );
  }
}

/**
 * Property type matching the backend API response
 */
export interface Property {
  id: string;
  title: string;
  slug: string;
  location: string;
  city: string;
  state: string;
  price: number;
  category: 'sale' | 'rent';
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
  isVerified: boolean;
}

export interface SearchPropertiesResponse {
  results: Property[];
  count: number;
  next: string | null;
  previous: string | null;
}

/**
 * Search properties from the backend API
 */
export async function searchProperties(
  filters: SearchFilterValues,
  page = 1,
  pageSize = 12
): Promise<ApiSuccessResponse<SearchPropertiesResponse>> {
  try {
    const params = new URLSearchParams();
    if (filters.location) params.append('location', filters.location);
    if (filters.propertyType && filters.propertyType !== 'any') params.append('property_type', filters.propertyType);
    if (filters.minPrice !== undefined) params.append('min_price', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.append('max_price', String(filters.maxPrice));
    if (filters.bedrooms && filters.bedrooms !== 'any') params.append('bedrooms', filters.bedrooms);
    params.append('page', String(page));
    params.append('page_size', String(pageSize));

    const response = await fetch(`${API_BASE_URL}/properties/search/?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        data?.message ||
        data?.detail ||
        (typeof data?.errors === "object" && data?.errors !== null
          ? Object.entries(data.errors)
              .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
              .join(" | ")
          : "Failed to search properties. Please try again.");

      throw new ApiClientError(errorMessage, response.status, data?.errors);
    }

    return data as ApiSuccessResponse<SearchPropertiesResponse>;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    throw new ApiClientError(
      "Unable to connect to Primekey server. Please check your network connection.",
      0
    );
  }
}