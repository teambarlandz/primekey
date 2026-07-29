import { API_CONFIG, getAuthToken } from './config';
import {
  SearchFilters,
  SearchResponse,
  Property,
  ConciergeLeadRequest,
  ConciergeLeadResponse,
  ApiErrorResponse,
} from './contracts';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly fieldErrors?: Record<string, string[]>,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromResponse(status: number, data: unknown): ApiError {
    const errorData = data as ApiErrorResponse | null;
    const fieldErrors = errorData?.errors;
    const code = (data as Record<string, unknown>)?.code as string | undefined;
    const message = errorData?.message || 'An unexpected error occurred';
    return new ApiError(status, message, fieldErrors, code);
  }
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    const token = getAuthToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= API_CONFIG.retries.max) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          if (response.status === 429 && attempt < API_CONFIG.retries.max) {
            const delay = API_CONFIG.rateLimitRetryDelay * Math.pow(API_CONFIG.retries.backoffMultiplier, attempt);
            await new Promise(r => setTimeout(r, delay));
            attempt++;
            continue;
          }
          throw ApiError.fromResponse(response.status, data);
        }

        return data as T;
      } catch (error) {
        lastError = error as Error;
        if (error instanceof ApiError) throw error;

        if (attempt < API_CONFIG.retries.max) {
          const delay = API_CONFIG.retries.delayMs * Math.pow(API_CONFIG.retries.backoffMultiplier, attempt);
          await new Promise(r => setTimeout(r, delay));
          attempt++;
        }
      }
    }

    throw new ApiError(0, lastError?.message || 'Network error. Please check your connection.');
  }

  async searchProperties(filters: SearchFilters): Promise<SearchResponse> {
    const params = new URLSearchParams();
    if (filters.location) params.set('location', filters.location);
    params.set('property_type', filters.propertyType);
    params.set('min_price', String(filters.minPrice));
    params.set('max_price', String(filters.maxPrice));
    params.set('bedrooms', filters.bedrooms);

    return this.request<SearchResponse>(`/properties/search/?${params.toString()}`);
  }

  async getProperty(id: string): Promise<Property> {
    return this.request<Property>(`/properties/${id}/`);
  }

  async submitConciergeLead(payload: ConciergeLeadRequest): Promise<ConciergeLeadResponse> {
    return this.request<ConciergeLeadResponse>('/crm/submit-concierge/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiClient();