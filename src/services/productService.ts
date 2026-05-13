import type { Category, Product } from '../types';

const BASE_URL = 'http://144.202.25.149/skeleton/api/v1';
const TIMEOUT_MS = 10_000;

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Combine two AbortSignals — aborts when either fires.
 * Used to respect both the timeout signal and the caller's unmount signal.
 */
function combineAbortSignals(s1: AbortSignal, s2: AbortSignal): AbortSignal {
  const controller = new AbortController();
  const abort = () => controller.abort();
  s1.addEventListener('abort', abort, { once: true });
  s2.addEventListener('abort', abort, { once: true });
  return controller.signal;
}

/**
 * Generic POST request helper.
 *
 * AbortController usage:
 *   - An internal controller fires after TIMEOUT_MS to cancel slow requests.
 *   - The caller passes its own signal (created in useEffect) that fires on
 *     component unmount. Both are merged so the fetch cancels on whichever
 *     comes first — preventing setState calls on unmounted components.
 */
async function post<T>(
  endpoint: string,
  body: Record<string, unknown> = {},
  signal?: AbortSignal,
): Promise<T> {
  // Internal timeout controller
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), TIMEOUT_MS);

  const combinedSignal = signal
    ? combineAbortSignals(signal, timeoutController.signal)
    : timeoutController.signal;

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: combinedSignal,
    });

    console.log('[ProductService]', endpoint, 'status:', response.status);

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.error('[ProductService] Non-JSON response:', text.substring(0, 300));
      throw new Error('Server error. Please try again later.');
    }

    const json: ApiResponse<T> = await response.json();

    if (!json.success) {
      throw new Error(json.message ?? 'Request failed');
    }

    return json.data as T;
  } catch (error) {
    if (error instanceof Error) {
      // Check AbortError FIRST before TypeError
      if (error.name === 'AbortError') {
        throw new Error('cancelled');
      }
      if (error.message === 'cancelled') {
        throw error;
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

// ── API response shapes from the server ──────────────────

interface ApiCategory {
  _id: string;
  name: string;
  image?: string;
  imageUrl?: string;
}

interface ApiProduct {
  _id: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  colors?: { label: string; hex: string }[];
  sizes?: string[];
  description?: string;
  rating?: number;
  reviewCount?: number;
  // category can be a nested object or a plain string ID
  category?: { _id: string; name: string } | string;
  categoryId?: string;
  similarProductIds?: string[];
  discount?: number;
  brand?: string;
}

interface ProductsApiResponse {
  data: ApiProduct[];
  meta?: { page: number; per_page: number; total: number };
}

// ── Mappers — API shape → app types ──────────────────────

function mapCategory(c: ApiCategory): Category {
  return {
    id: c._id,
    name: c.name,
    imageUrl: c.image ?? c.imageUrl ?? '',
  };
}

function mapProduct(p: ApiProduct): Product {
  const categoryId =
    typeof p.category === 'object' && p.category !== null
      ? p.category._id
      : (p.category as string | undefined) ?? p.categoryId ?? '';

  return {
    id: p._id,
    name: p.name,
    price: p.price,
    images: p.images ?? (p.image ? [p.image] : []),
    colorOptions: (p.colors ?? []).map((c) => ({ label: c.label, hex: c.hex })),
    sizeOptions: p.sizes ?? [],
    description: p.description ?? '',
    rating: p.rating ?? 0,
    reviewCount: p.reviewCount ?? 0,
    categoryId,
    similarProductIds: p.similarProductIds ?? [],
  };
}

// Safely extract product array from any response shape
function extractProducts(raw: unknown): ApiProduct[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    // { data: [...] }
    if (Array.isArray(obj.data)) return obj.data as ApiProduct[];
    // { products: [...] }
    if (Array.isArray(obj.products)) return obj.products as ApiProduct[];
  }
  console.error('[ProductService] Unexpected products shape:', JSON.stringify(raw)?.substring(0, 200));
  return [];
}

// ── Service ───────────────────────────────────────────────

export const ProductService = {
  /**
   * POST /categories/list
   * No body required.
   */
  getCategories: async (signal?: AbortSignal): Promise<Category[]> => {
    const raw = await post<unknown>('/categories/list', {}, signal);
    console.log('[ProductService] categories raw type:', typeof raw, Array.isArray(raw) ? 'array' : 'object');
    const arr = Array.isArray(raw) ? raw as ApiCategory[] : [];
    return arr.map(mapCategory);
  },

  /**
   * POST /products/list
   * Response: { data: { data: Product[], meta: {...} } }
   * Optional: categoryId, page, per_page
   */
  getProducts: async (
    params: {
      categoryId?: string;
      page?: number;
      per_page?: number;
    } = {},
    signal?: AbortSignal,
  ): Promise<Product[]> => {
    const raw = await post<unknown>('/products/list', params, signal);
    console.log('[ProductService] products raw type:', typeof raw, Array.isArray(raw) ? 'array' : 'object');
    const arr = extractProducts(raw);
    return arr.map(mapProduct);
  },

  /**
   * POST /products/single
   * Body: { productId }
   */
  getProductById: async (
    productId: string,
    signal?: AbortSignal,
  ): Promise<Product> => {
    const data = await post<ApiProduct>('/products/single', { productId }, signal);
    return mapProduct(data);
  },

  /**
   * POST /products/related
   * Body: { categoryId, productId, limit }
   */
  getRelatedProducts: async (
    categoryId: string,
    productId: string,
    signal?: AbortSignal,
  ): Promise<Product[]> => {
    const raw = await post<unknown>(
      '/products/related',
      { categoryId, productId, limit: 6 },
      signal,
    );
    const arr = extractProducts(raw);
    return arr.map(mapProduct);
  },
};
