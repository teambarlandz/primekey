import { API_BASE_PATH } from './contracts';

export const API_CONFIG = {
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${API_BASE_PATH}`,
  timeout: 15000,
  retries: {
    max: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
  },
  rateLimitRetryDelay: 2000,
} as const;

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('primekey_auth_token');
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('primekey_auth_token', token);
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('primekey_auth_token');
}