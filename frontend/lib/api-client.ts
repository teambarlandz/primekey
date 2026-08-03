import { ConciergeFormValues } from "@/lib/validations/conciergeSchema";
import { LandlordRegistrationValues } from "@/lib/validations/landlordSchema";
import { SearchFilterValues } from "@/lib/validations/searchSchema";
import { ListingCategory } from "@/types/property";

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
  leads_hot: number;
  leads_warm: number;
  leads_cold: number;
  leads_sla_breached: number;
}

export interface DashboardLead {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  preferred_location: string;
  property_type: string;
  budget_max: number;
  status: string;
  tier: 'HOT' | 'WARM' | 'COLD' | null;
  priority_score: number;
  is_sla_breached: boolean;
  sla_deadline: string | null;
  sla_remaining_minutes: number | null;
  assigned_agent: string | null;
  listing_title: string | null;
  inquiry_message: string;
  created_at: string;
}

export interface WhatsAppThread {
  id: string;
  phone: string;
  display_name: string;
  concierge_lead: string | null;
  landlord: string | null;
  lead_name: string;
  last_message: string;
  last_message_at: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessage {
  id: string;
  direction: 'outbound' | 'inbound';
  body: string;
  created_at: string;
}

export interface DocumentVaultEntry {
  id: string;
  landlord: string;
  landlord_name: string;
  landlord_phone?: string;
  intake: string | null;
  intake_title: string | null;
  doc_type: string;
  doc_type_label?: string;
  file_url: string;
  review_status: 'pending' | 'approved' | 'rejected';
  review_notes: string;
  uploaded_at: string;
  reviewed_at: string | null;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  const international = digits.startsWith('0') ? `234${digits.slice(1)}` : digits;
  return `https://wa.me/${international}?text=${encodeURIComponent(message)}`;
}

export function formatWhatsAppPhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
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
const BASE_URL_RAW = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const API_BASE_URL = BASE_URL_RAW.replace(/\/+$/, "");

// --- Agent auth token helpers (localStorage-backed) ---
const AGENT_ACCESS_KEY = "primekey_agent_access";
const AGENT_REFRESH_KEY = "primekey_agent_refresh";
const AGENT_PROFILE_KEY = "primekey_agent_profile";

export interface AgentSessionProfile {
  id: string;
  phone: string;
  full_name: string;
  role: "agent" | "manager" | "admin";
}

export function getAgentAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AGENT_ACCESS_KEY);
}

export function getAgentRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AGENT_REFRESH_KEY);
}

export function getAgentProfile(): AgentSessionProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AGENT_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AgentSessionProfile;
  } catch {
    return null;
  }
}

export function isAgentLoggedIn(): boolean {
  return getAgentAccessToken() !== null;
}

export function saveAgentSession(access: string, refresh: string, profile: AgentSessionProfile): void {
  window.localStorage.setItem(AGENT_ACCESS_KEY, access);
  window.localStorage.setItem(AGENT_REFRESH_KEY, refresh);
  window.localStorage.setItem(AGENT_PROFILE_KEY, JSON.stringify(profile));
}

export function clearAgentSession(): void {
  window.localStorage.removeItem(AGENT_ACCESS_KEY);
  window.localStorage.removeItem(AGENT_REFRESH_KEY);
  window.localStorage.removeItem(AGENT_PROFILE_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getAgentAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: AgentSessionProfile & { is_new_user?: boolean };
}

export interface SendOtpResponse {
  data: { phone: string; purpose: string; expires_in_minutes: number; dev_code?: string };
}

/**
 * Request an OTP code (agent_login purpose for agents).
 */
export async function sendOtp(phone: string, purpose: "login" | "agent_login" | "register" = "login"): Promise<SendOtpResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/otp/send/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
    body: JSON.stringify({ phone, purpose }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || data?.detail || "Failed to send OTP.";
    throw new ApiClientError(message, response.status, data?.errors);
  }
  return data as SendOtpResponse;
}

/**
 * Verify an OTP and store the returned agent JWT session.
 */
export async function verifyAgentOtp(phone: string, code: string): Promise<AgentSessionProfile> {
  const response = await fetch(`${API_BASE_URL}/auth/otp/verify/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
    body: JSON.stringify({ phone, code, purpose: "agent_login" }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || data?.detail || "OTP verification failed.";
    throw new ApiClientError(message, response.status, data?.errors);
  }

  const auth = data.data as AuthResponse;
  const profile: AgentSessionProfile = {
    id: auth.user.id,
    phone: auth.user.phone,
    full_name: auth.user.full_name,
    role: auth.user.role,
  };
  saveAgentSession(auth.access, auth.refresh, profile);
  return profile;
}

export async function refreshAgentAccessToken(): Promise<boolean> {
  const refresh = getAgentRefreshToken();
  if (!refresh) return false;

  const response = await fetch(`${API_BASE_URL}/auth/otp/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
    body: JSON.stringify({ refresh }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.access) {
    clearAgentSession();
    return false;
  }

  window.localStorage.setItem(AGENT_ACCESS_KEY, data.access);
  if (data.refresh) window.localStorage.setItem(AGENT_REFRESH_KEY, data.refresh);
  return true;
}

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
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
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
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || data?.detail || "Failed to load landlord leads.";
    throw new ApiClientError(errorMessage, response.status, data?.errors);
  }

  return (data?.data ?? []) as DashboardLandlord[];
}

/**
 * Fetch scored concierge leads for the agent dashboard.
 */
export async function fetchDashboardLeads(): Promise<DashboardLead[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/leads/`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || data?.detail || "Failed to load concierge leads.";
    throw new ApiClientError(errorMessage, response.status, data?.errors);
  }

  return (data?.data ?? []) as DashboardLead[];
}

/**
 * Fetch property intakes for the agent dashboard.
 */
export async function fetchIntakes(): Promise<DashboardIntake[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/intakes/`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
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
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
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
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
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
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
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
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
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
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
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
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
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
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
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
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
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
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
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
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
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
 * List WhatsApp threads (agent-only).
 */
export async function fetchWhatsAppThreads(): Promise<WhatsAppThread[]> {
  const response = await fetch(`${API_BASE_URL}/messaging/threads/`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || data?.detail || "Failed to load WhatsApp threads.";
    throw new ApiClientError(message, response.status, data?.errors);
  }
  return (data?.data ?? []) as WhatsAppThread[];
}

/**
 * Start (or reuse) a WhatsApp thread and log an outbound message.
 */
export async function startWhatsAppThread(payload: {
  phone: string;
  display_name?: string;
  concierge_lead?: string;
  landlord?: string;
  message?: string;
}): Promise<WhatsAppThread> {
  const response = await fetch(`${API_BASE_URL}/messaging/threads/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || data?.detail || "Failed to start WhatsApp conversation.";
    throw new ApiClientError(message, response.status, data?.errors);
  }
  return data?.data as WhatsAppThread;
}

/**
 * Fetch message history for a thread.
 */
export async function fetchWhatsAppMessages(threadId: string): Promise<WhatsAppMessage[]> {
  const response = await fetch(`${API_BASE_URL}/messaging/threads/${threadId}/messages/`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || data?.detail || "Failed to load chat history.";
    throw new ApiClientError(message, response.status, data?.errors);
  }
  return (data?.data ?? []) as WhatsAppMessage[];
}

/**
 * Log a new outbound message to a thread.
 */
export async function sendWhatsAppMessage(threadId: string, body: string): Promise<WhatsAppMessage> {
  const response = await fetch(`${API_BASE_URL}/messaging/threads/${threadId}/messages/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
    body: JSON.stringify({ body }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || data?.detail || "Failed to send message.";
    throw new ApiClientError(message, response.status, data?.errors);
  }
  return data?.data as WhatsAppMessage;
}

/**
 * Upload a document to the vault (landlord-side, unauthenticated).
 */
export async function uploadLandlordDocument(payload: {
  landlord_id: string;
  intake_id?: string;
  doc_type: string;
  file: File;
}): Promise<DocumentVaultEntry> {
  const form = new FormData();
  form.append('landlord_id', payload.landlord_id);
  if (payload.intake_id) form.append('intake_id', payload.intake_id);
  form.append('doc_type', payload.doc_type);
  form.append('file', payload.file);

  const response = await fetch(`${API_BASE_URL}/landlords/documents/`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: form,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || data?.detail || "Failed to upload document.";
    throw new ApiClientError(message, response.status, data?.errors);
  }
  return data?.data as DocumentVaultEntry;
}

/**
 * List documents uploaded by a landlord.
 */
export async function fetchLandlordDocuments(landlordId: string): Promise<DocumentVaultEntry[]> {
  const response = await fetch(`${API_BASE_URL}/landlords/landlords/${landlordId}/documents/`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || data?.detail || "Failed to load documents.";
    throw new ApiClientError(message, response.status, data?.errors);
  }
  return (data?.data ?? []) as DocumentVaultEntry[];
}

/**
 * List all documents for agent review.
 */
export async function fetchDashboardDocuments(): Promise<DocumentVaultEntry[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/documents/`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || data?.detail || "Failed to load documents.";
    throw new ApiClientError(message, response.status, data?.errors);
  }
  return (data?.data ?? []) as DocumentVaultEntry[];
}

/**
 * Approve or reject a vault document (agent-side).
 */
export async function reviewDocument(
  id: string,
  review_status: 'approved' | 'rejected',
  review_notes = ''
): Promise<DocumentVaultEntry> {
  const response = await fetch(`${API_BASE_URL}/dashboard/documents/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
    body: JSON.stringify({ review_status, review_notes }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || data?.detail || "Failed to update document.";
    throw new ApiClientError(message, response.status, data?.errors);
  }
  return data?.data as DocumentVaultEntry;
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
  category: 'sale' | 'rent' | 'short_let';
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
  isVerified: boolean;
  isFeatured?: boolean;
  serviced?: boolean;
}

export interface SearchPropertiesResponse {
  results: Property[];
  count: number;
  next: string | null;
  previous: string | null;
}

interface BackendPropertyRow {
  id: string;
  title: string;
  purpose?: string;
  property_type: string;
  property_type_display: string;
  price: string;
  currency: string;
  is_negotiable: boolean;
  address: string;
  area: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  is_serviced: boolean;
  is_furnished: boolean;
  status: string;
  status_display: string;
  is_featured: boolean;
  primary_image: { image_url: string } | null;
  created_at: string;
}

function mapBackendProperty(row: BackendPropertyRow): Property {
  const category: ListingCategory = (row.purpose || (row.property_type === 'short_let' ? 'rent' : 'sale')) as ListingCategory;
  return {
    id: row.id,
    title: row.title,
    slug: row.id,
    location: [row.area, row.city].filter(Boolean).join(', ') || row.address,
    city: row.city,
    state: row.state,
    price: Number(row.price),
    category,
    propertyType: row.property_type,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    imageUrl: row.primary_image?.image_url || '/assets/hero-primekey-homes.jpg',
    isVerified: row.status === 'available',
    isFeatured: row.is_featured,
    serviced: row.is_serviced,
  };
}

export interface PropertyImageData {
  id: string;
  image_url: string;
  caption: string | null;
  is_primary: boolean;
}

export interface PropertyDetailData {
  id: string;
  title: string;
  description: string;
  property_type: string;
  property_type_display: string;
  price: string | number;
  currency: string;
  is_negotiable: boolean;
  address: string;
  city: string;
  state: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  is_serviced: boolean;
  is_furnished: boolean;
  status: string;
  status_display: string;
  is_featured: boolean;
  images: PropertyImageData[];
  created_at: string;
  updated_at: string;
}

export async function fetchPropertyDetail(
  propertyId: string
): Promise<ApiSuccessResponse<PropertyDetailData>> {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/properties/${propertyId}/`, {
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
          : "This listing could not be loaded.");
      throw new ApiClientError(errorMessage, response.status, data?.errors);
    }

    return data as ApiSuccessResponse<PropertyDetailData>;
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

export interface PropertyInquiryPayload {
  full_name: string;
  phone: string;
  email?: string;
  inquiry_message: string;
  ndpr_consent: boolean;
}

export interface PropertyInquiryResult {
  id: string;
  status: string;
  priority_score: number;
  tier: string;
  property_title: string;
}

/**
 * Submit a buyer inquiry for a specific listing from its detail page.
 */
export async function submitPropertyInquiry(
  propertyId: string,
  payload: PropertyInquiryPayload
): Promise<ApiSuccessResponse<PropertyInquiryResult>> {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/properties/${propertyId}/inquiries/`, {
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
          : "Failed to submit your inquiry. Please try again.");

      throw new ApiClientError(errorMessage, response.status, data?.errors);
    }

    return data as ApiSuccessResponse<PropertyInquiryResult>;
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
    if (filters.purpose && filters.purpose !== 'all') params.append('purpose', filters.purpose);
    if (filters.propertyType && filters.propertyType !== 'any') params.append('property_type', filters.propertyType);
    if (filters.minPrice !== undefined) params.append('min_price', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.append('max_price', String(filters.maxPrice));
    if (filters.bedrooms && filters.bedrooms !== 'any') params.append('bedrooms', filters.bedrooms);
    if (filters.sortBy && filters.sortBy !== 'newest') {
      params.append('sort_by', filters.sortBy === 'price_asc' ? 'price' : '-price');
    }
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

    const raw = data as ApiSuccessResponse<{ results: BackendPropertyRow[]; count: number; next: string | null; previous: string | null }> & { results?: BackendPropertyRow[]; count?: number; next?: string | null; previous?: string | null };
    const payload = (raw.data ?? raw) as { results?: BackendPropertyRow[]; count?: number; next?: string | null; previous?: string | null };
    const mapped: SearchPropertiesResponse = {
      results: (payload.results || []).map(mapBackendProperty),
      count: payload.count || 0,
      next: payload.next || null,
      previous: payload.previous || null,
    };
    return { success: raw.success ?? true, message: raw.message || 'OK', data: mapped } as ApiSuccessResponse<SearchPropertiesResponse>;
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
