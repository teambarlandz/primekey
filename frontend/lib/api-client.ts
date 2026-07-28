import { ConciergeFormValues } from "@/lib/schemas/conciergeFormSchema";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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
        property_type: formData.propertyType,
        budget_min: formData.budgetMin,
        budget_max: formData.budgetMax,
        bedrooms: formData.bedrooms,
        ndpr_consent: formData.ndprConsent, // 👈 Fixed: snake_case
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // Extract DRF field validation message or fallback to message/detail
      const errorMessage =
        data?.message ||
        data?.detail ||
        (typeof data === "object" && data !== null
          ? Object.entries(data)
              .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
              .join(" | ")
          : "Failed to submit concierge request. Please try again.");

      throw new ApiClientError(errorMessage, response.status, data);
    }

    return data as ApiSuccessResponse;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Handles offline network failure or unhandled exception
    throw new ApiClientError(
      "Unable to connect to Primekey server. Please check your network connection.",
      0
    );
  }
}
