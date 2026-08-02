import { ConciergeFormValues } from "@/lib/validations/conciergeSchema";
import { LandlordRegistrationValues } from "@/lib/validations/landlordSchema";
import { SearchFilterValues } from "@/lib/validations/searchSchema";

export type PropertyIntakePayload = {
  landlord: string;
  title: string;
  property_type: string;
  price: number;
  is_negotiable: boolean;
  address: string;
  city: string;
  state: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  description: string;
};

export type AppointmentPayload = {
  landlord: string;
  preferred_date: string;
  time_slot: string;
  tour_type: 'in_person' | 'virtual';
  notes: string;
};

export interface DashboardSummary {
  total_landlords: number;
  landlords_pending_verification: number;
  total_intakes: number;
  intakes_submitted: number;
  intakes_approved: number;
  intakes_rejected: number;
  total_appointments: number;
  appointments_pending: number;
  appointments_confirmed: number;
  total_concierge_leads: number;
  leads_new_7d: number;
}

export interface DashboardLandlord {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  id_type: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  property_count: number;
  intake_count: number;
  appointment_count: number;
  created_at: string;
}

export interface DashboardIntake {
  id: string;
  title: string;
  property_type: string;
  price: string;
  is_negotiable: boolean;
  address: string;
  area: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  landlord_name: string;
  landlord_phone: string;
  created_at: string;
}

export interface DashboardAppointment {
  id: string;
  preferred_date: string;
  time_slot: string;
  tour_type: 'in_person' | 'virtual';
  notes: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  landlord_name: string;
  landlord_phone: string;
  created_at: string;
}

export interface LandlordProfile {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  id_type: string;
  id_number: string;
  property_count: number;
  ndpr_consent: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface LandlordIntake {
  id: string;
  title: string;
  property_type: string;
  price: string;
  is_negotiable: boolean;
  address: string;
  area: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  description: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_at: string;
}

export interface LandlordAppointment {
  id: string;
  preferred_date: string;
  time_slot: string;
  tour_type: 'in_person' | 'virtual';
  notes: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

export interface AppNotification {
  id: string;
  recipient_type: 'landlord' | 'agent';
  recipient_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  data: AppNotification[];
  unread_count: number;
}

/**
 * Returns the landlord profile id persisted after registration, or null.
 */
export function getStoredLandlordId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('primekey_landlord_id');
}

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
 * Submit Property Intake payload to Django REST Framework backend.
 */
export async function submitPropertyIntake(
  payload: PropertyIntakePayload
): Promise<ApiSuccessResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/landlords/intakes/`, {
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
          : "Failed to submit property intake. Please try again.");

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
 * Submit Appointment booking payload to Django REST Framework backend.
 */
export async function submitAppointment(
  payload: AppointmentPayload
): Promise<ApiSuccessResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/landlords/appointments/`, {
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
          : "Failed to book appointment. Please try again.");

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
 * Fetch agent dashboard summary stats.
 */
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await fetch(`${API_BASE_URL}/dashboard/summary/`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      data?.message || data?.detail || "Failed to load dashboard summary.";
    throw new ApiClientError(errorMessage, response.status, data?.errors);
  }

  return (data?.data ?? {}) as DashboardSummary;
}

/**
 * Fetch landlord leads for the agent dashboard.
 */
export async function fetchLandlordLeads(): Promise<DashboardLandlord[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/landlords/`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || data?.detail || "Failed to load landlord leads.";
    throw new ApiClientError(errorMessage, response.status, data?.errors);
  }

  return (data?.data ?? []) as DashboardLandlord[];
}

/**
 * Fetch property intakes for the agent dashboard.
 */
export async function fetchIntakes(): Promise<DashboardIntake[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/intakes/`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || data?.detail || "Failed to load property intakes.";
    throw new ApiClientError(errorMessage, response.status, data?.errors);
  }

  return (data?.data ?? []) as DashboardIntake[];
}

/**
 * Fetch appointments for the agent dashboard.
 */
export async function fetchAppointments(): Promise<DashboardAppointment[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/appointments/`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || data?.detail || "Failed to load appointments.";
    throw new ApiClientError(errorMessage, response.status, data?.errors);
  }

  return (data?.data ?? []) as DashboardAppointment[];
}

/**
 * Update a landlord's verification status from the agent dashboard.
 */
export async function updateLandlordVerification(
  id: string,
  status: 'approved' | 'rejected' | 'pending'
): Promise<DashboardLandlord> {
  const response = await fetch(`${API_BASE_URL}/dashboard/landlords/${id}/verification/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ verification_status: status }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || data?.detail || "Failed to update verification status.";
    throw new ApiClientError(errorMessage, response.status, data?.errors);
  }

  return data?.data as DashboardLandlord;
}

/**
 * Update a property intake status from the agent dashboard.
 */
export async function updateIntakeStatus(
  id: string,
  status: 'approved' | 'rejected' | 'submitted'
): Promise<DashboardIntake> {
  const response = await fetch(`${API_BASE_URL}/dashboard/intakes/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ status }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || data?.detail || "Failed to update intake status.";
    throw new ApiClientError(errorMessage, response.status, data?.errors);
  }

  return data?.data as DashboardIntake;
}

/**
 * Update an appointment (confirm/cancel/reschedule) from the agent dashboard.
 */
export async function updateAppointment(
  id: string,
  payload: { status?: string; preferred_date?: string; time_slot?: string }
): Promise<DashboardAppointment> {
  const response = await fetch(`${API_BASE_URL}/dashboard/appointments/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || data?.detail || "Failed to update appointment.";
    throw new ApiClientError(errorMessage, response.status, data?.errors);
  }

  return data?.data as DashboardAppointment;
}

/**
 * Fetch a landlord profile by id.
 */
export async function fetchLandlordProfile(id: string): Promise<LandlordProfile> {
  const response = await fetch(`${API_BASE_URL}/landlords/profiles/${id}/`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || data?.detail || "Failed to load profile.";
    throw new ApiClientError(errorMessage, response.status, data?.errors);
  }

  return (data?.data ?? data) as LandlordProfile;
}

/**
 * Fetch a landlord's own property intakes.
 */
export async function fetchLandlordIntakes(id: string): Promise<LandlordIntake[]> {
  const response = await fetch(`${API_BASE_URL}/landlords/landlords/${id}/intakes/`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || data?.detail || "Failed to load your listings.";
    throw new ApiClientError(errorMessage, response.status, data?.errors);
  }

  return (data?.data ?? []) as LandlordIntake[];
}

/**
 * Fetch a landlord's own appointments.
 */
export async function fetchLandlordAppointments(id: string): Promise<LandlordAppointment[]> {
  const response = await fetch(`${API_BASE_URL}/landlords/landlords/${id}/appointments/`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || data?.detail || "Failed to load your appointments.";
    throw new ApiClientError(errorMessage, response.status, data?.errors);
  }

  return (data?.data ?? []) as LandlordAppointment[];
}

/**
 * Update an appointment as the landlord (cancel or reschedule).
 */
export async function updateLandlordAppointment(
  id: string,
  payload: { status?: 'cancelled'; preferred_date?: string; time_slot?: string }
): Promise<LandlordAppointment> {
  const response = await fetch(`${API_BASE_URL}/landlords/appointments/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || data?.detail || "Failed to update appointment.";
    throw new ApiClientError(errorMessage, response.status, data?.errors);
  }

  return data?.data as LandlordAppointment;
}

/**
 * Fetch notifications for a recipient (landlord requires recipient_id).
 */
export async function fetchNotifications(
  recipientType: 'landlord' | 'agent',
  recipientId?: string
): Promise<NotificationsResponse> {
  const params = new URLSearchParams({ recipient_type: recipientType });
  if (recipientId) params.append('recipient_id', recipientId);

  const response = await fetch(`${API_BASE_URL}/notifications/?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || data?.detail || "Failed to load notifications.";
    throw new ApiClientError(errorMessage, response.status, data?.errors);
  }

  return data as NotificationsResponse;
}

/**
 * Mark a notification as read or unread.
 */
export async function markNotificationRead(id: string, isRead = true): Promise<AppNotification> {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ is_read: isRead }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || data?.detail || "Failed to update notification.";
    throw new ApiClientError(errorMessage, response.status, data?.errors);
  }

  return data?.data as AppNotification;
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