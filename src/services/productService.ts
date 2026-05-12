import type { Category, Product } from '../types';

const BASE_URL = 'http://144.202.25.149/skeleton/api/v1';
const TIMEOUT_MS = 10_000;

// Feature flag: set to false to use mock data until backend is ready
const USE_API = false;

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Generic request helper with AbortController for cancellation.
 * Throws on network errors, timeouts, or API-level failures.
 */
async function request<T>(
  endpoint: string,
  signal?: AbortSignal,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // Chain signals: abort if either the timeout OR the passed signal fires
  const combinedSignal = signal
    ? combineAbortSignals(signal, controller.signal)
    : controller.signal;

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: combinedSignal,
    });

    console.log('[ProductService]', endpoint, 'status:', response.status);

    // Check if response is actually JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('[ProductService] Non-JSON response:', text.substring(0, 200));
      throw new Error(`Server returned ${contentType || 'non-JSON'} instead of JSON. Endpoint may not exist.`);
    }

    const json: ApiResponse<T> = await response.json();

    if (json.success === false) {
      throw new Error(json.message ?? 'Request failed');
    }

    return json.data as T;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out or was cancelled');
      }
      if (error instanceof TypeError) {
        throw new Error('Unable to connect. Check your internet connection.');
      }
      throw error;
    }
    throw new Error('Unable to connect. Check your internet connection.');
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Combine two AbortSignals: abort when either fires.
 * Used to respect both timeout and component unmount signals.
 */
function combineAbortSignals(
  signal1: AbortSignal,
  signal2: AbortSignal,
): AbortSignal {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal1.addEventListener('abort', abort, { once: true });
  signal2.addEventListener('abort', abort, { once: true });
  return controller.signal;
}

export const ProductService = {
  /**
   * GET /categories/list
   * Returns array of categories
   */
  getCategories: async (signal?: AbortSignal): Promise<Category[]> => {
    if (!USE_API) {
      throw new Error('API disabled - using mock data');
    }
    const data = await request<Category[]>('/categories/list', signal);
    return data;
  },

  /**
   * GET /products/list
   * Returns array of all products
   */
  getProducts: async (signal?: AbortSignal): Promise<Product[]> => {
    if (!USE_API) {
      throw new Error('API disabled - using mock data');
    }
    const data = await request<Product[]>('/products/list', signal);
    return data;
  },

  /**
   * GET /products/single?id=<productId>
   * Returns a single product by ID
   */
  getProductById: async (
    productId: string,
    signal?: AbortSignal,
  ): Promise<Product> => {
    if (!USE_API) {
      throw new Error('API disabled - using mock data');
    }
    const data = await request<Product>(
      `/products/single?id=${encodeURIComponent(productId)}`,
      signal,
    );
    return data;
  },
};
