import type { User } from '../types';

const BASE_URL = 'http://144.202.25.149/skeleton/api/v1';
const TIMEOUT_MS = 10_000;

export interface AuthResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
  data?: {
    // Register response — user fields at top level of data
    _id?: string;
    id?: string;
    fullName?: string;
    email?: string;
    token?: string;
    // Login response — token at top level, user nested under data.user
    user?: {
      _id?: string;
      id?: string;
      fullName?: string;
      email?: string;
    };
  };
}

export interface AuthServiceError {
  message: string;
  code: 'NETWORK_ERROR' | 'TIMEOUT' | 'API_ERROR' | 'UNKNOWN';
}

async function request<T>(
  endpoint: string,
  body: Record<string, string>,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const json: AuthResponse = await response.json();

    if (json.success === false) {
      // API returns either message string or errors object
      const msg = json.message
        ?? (json.errors ? Object.values(json.errors)[0] : undefined)
        ?? 'An error occurred. Please try again.';
      throw new Error(msg);
    }

    return json as unknown as T;
  } catch (error) {
    if (error instanceof Error) {
      // Timeout: AbortController fires a DOMException with name 'AbortError'
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      // Network-level failure: fetch() rejects with a TypeError
      if (error instanceof TypeError) {
        throw new Error(
          'Unable to connect. Please check your internet connection.',
        );
      }
      // API error or any other Error we already constructed — re-throw as-is
      throw error;
    }
    throw new Error('Unable to connect. Please check your internet connection.');
  } finally {
    clearTimeout(timeoutId);
  }
}

export const AuthService = {
  /**
   * Register a new user.
   * POST /users/register
   * Body: { fullName, email, password }
   * Returns: { user, token } on success
   * Throws: Error on failure
   */
  register: async (
    fullName: string,
    email: string,
    password: string,
  ): Promise<{ user: User; token: string }> => {
    const json = await request<AuthResponse>('/users/register', {
      fullName,
      email,
      password,
    });

    const data = (json as AuthResponse).data!;
    // Register: user fields are at top level of data
    return {
      user: { id: data._id ?? data.id ?? '', fullName: data.fullName ?? '', email: data.email ?? '' },
      token: data.token ?? '',
    };
  },

  /**
   * Login an existing user.
   * POST /users/login
   * Body: { email, password }
   * Returns: { user, token } on success
   * Throws: Error on failure
   */
  login: async (
    email: string,
    password: string,
  ): Promise<{ user: User; token: string }> => {
    const json = await request<AuthResponse>('/users/login', {
      email,
      password,
    });

    const data = (json as AuthResponse).data!;
    // Login: token at data.token, user nested at data.user
    const u = data.user ?? data;
    return {
      user: { id: u._id ?? u.id ?? '', fullName: u.fullName ?? '', email: u.email ?? email },
      token: data.token ?? '',
    };
  },
};
