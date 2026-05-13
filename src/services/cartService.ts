import { TokenStore } from './tokenStore';

const BASE_URL = 'http://144.202.25.149/skeleton/api/v1';
const TIMEOUT_MS = 10_000;

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Authenticated POST request with AbortController support.
 * Reads the JWT from TokenStore and attaches it as Bearer token.
 * The caller passes a signal from their useEffect AbortController —
 * if the component unmounts before the request completes, the fetch
 * is cancelled and no state update happens (prevents memory leaks).
 */
async function authPost<T>(
  endpoint: string,
  body: Record<string, unknown> = {},
  signal?: AbortSignal,
): Promise<T> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), TIMEOUT_MS);

  // Merge caller signal + timeout signal
  let combinedSignal = timeoutController.signal;
  if (signal) {
    const merged = new AbortController();
    const abort = () => merged.abort();
    signal.addEventListener('abort', abort, { once: true });
    timeoutController.signal.addEventListener('abort', abort, { once: true });
    combinedSignal = merged.signal;
  }

  try {
    const token = await TokenStore.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: combinedSignal,
    });

    const json: ApiResponse<T> = await response.json();

    if (!json.success) {
      throw new Error(json.message ?? 'Request failed');
    }

    return json.data as T;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') throw new Error('cancelled');
      if (error instanceof TypeError) throw new Error('Unable to connect.');
      throw error;
    }
    throw new Error('Unable to connect.');
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Cart Service ──────────────────────────────────────────

export const CartService = {
  /**
   * POST /cart/add
   * Body: { productId, quantity }
   */
  addToCart: async (
    productId: string,
    quantity: number = 1,
    signal?: AbortSignal,
  ): Promise<void> => {
    await authPost('/cart/add', { productId, quantity }, signal);
  },

  /**
   * POST /cart/remove
   * Body: { productId }
   */
  removeFromCart: async (
    productId: string,
    signal?: AbortSignal,
  ): Promise<void> => {
    await authPost('/cart/remove', { productId }, signal);
  },

  /**
   * POST /cart/clear
   * No body required.
   */
  clearCart: async (signal?: AbortSignal): Promise<void> => {
    await authPost('/cart/clear', {}, signal);
  },
};

// ── Order Service ─────────────────────────────────────────

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type PaymentMethod = 'cod' | 'card' | 'online';

export const OrderService = {
  /**
   * POST /orders/create
   * Body: { shippingAddress, paymentMethod, notes? }
   */
  createOrder: async (
    shippingAddress: ShippingAddress,
    paymentMethod: PaymentMethod,
    notes?: string,
    signal?: AbortSignal,
  ): Promise<{ orderId: string }> => {
    const data = await authPost<{ _id?: string; orderId?: string }>(
      '/orders/create',
      { shippingAddress, paymentMethod, ...(notes ? { notes } : {}) },
      signal,
    );
    return { orderId: data?._id ?? data?.orderId ?? '' };
  },
};
