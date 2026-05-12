import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useMemo,
  type ReactNode,
} from 'react';
import type { Product, Category, FilterState, SortOption } from '../types';
import { mockCategories } from '../data/mockCategories';
import { mockProducts } from '../data/mockProducts';
import { ProductService } from '../services/productService';

// ── State shape ───────────────────────────────────────────

interface ProductState {
  products: Product[];
  categories: Category[];
  filters: FilterState;
  isLoading: boolean;
  error: string | null;
}

// ── Action types ──────────────────────────────────────────

type ProductAction =
  | { type: 'SET_FILTER'; payload: Partial<FilterState> }
  | { type: 'SET_SORT'; payload: SortOption }
  | { type: 'LOAD_PRODUCTS'; payload: Product[] }
  | { type: 'LOAD_CATEGORIES'; payload: Category[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// ── Initial state ─────────────────────────────────────────

const initialState: ProductState = {
  products: mockProducts,
  categories: mockCategories,
  filters: {
    categoryId: null,
    sortBy: 'newest',
  },
  isLoading: false,
  error: null,
};

// ── Reducer ───────────────────────────────────────────────

function productReducer(state: ProductState, action: ProductAction): ProductState {
  switch (action.type) {
    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case 'SET_SORT':
      return {
        ...state,
        filters: { ...state.filters, sortBy: action.payload },
      };

    case 'LOAD_PRODUCTS':
      return {
        ...state,
        products: action.payload,
      };

    case 'LOAD_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────

interface ProductContextValue {
  state: ProductState;
  filteredProducts: Product[];
  setFilter: (filter: Partial<FilterState>) => void;
  setSort: (sortBy: SortOption) => void;
  loadProducts: (products: Product[]) => void;
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────

interface ProductProviderProps {
  children: ReactNode;
}

export function ProductProvider({ children }: ProductProviderProps) {
  const [state, dispatch] = useReducer(productReducer, initialState);

  // ── Fetch categories and products from API on mount ───────
  // AbortController is created here and its signal passed to the service.
  // When the component unmounts, the cleanup function calls controller.abort(),
  // which cancels any in-flight fetch — preventing setState on unmounted component.
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      try {
        const [categories, products] = await Promise.all([
          ProductService.getCategories(controller.signal),
          ProductService.getProducts(controller.signal),
        ]);
        dispatch({ type: 'LOAD_CATEGORIES', payload: categories });
        dispatch({ type: 'LOAD_PRODUCTS', payload: products });
      } catch (error) {
        // Ignore abort errors — they're intentional on unmount
        if (error instanceof Error && error.message.includes('cancelled')) return;
        // Ignore the mock-data fallback flag — not a real error
        if (error instanceof Error && error.message.includes('API disabled')) return;
        const message = error instanceof Error ? error.message : 'Failed to load data';
        console.warn('[ProductContext] API fetch failed, using mock data:', message);
        dispatch({ type: 'SET_ERROR', payload: message });
        // Keep mock data as fallback — already loaded in initialState
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchData();

    // Cleanup: abort the fetch if the provider unmounts
    return () => controller.abort();
  }, []);

  const setFilter = (filter: Partial<FilterState>): void => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const setSort = (sortBy: SortOption): void => {
    dispatch({ type: 'SET_SORT', payload: sortBy });
  };

  const loadProducts = (products: Product[]): void => {
    dispatch({ type: 'LOAD_PRODUCTS', payload: products });
  };

  // Compute filtered and sorted products
  const filteredProducts = useMemo(() => {
    if (!state.products || !Array.isArray(state.products)) return [];
    let result = [...state.products];

    // Filter by categoryId
    if (state.filters.categoryId) {
      result = result.filter((p) => p.categoryId === state.filters.categoryId);
    }

    // Filter by price range
    if (state.filters.priceMin !== undefined) {
      result = result.filter((p) => p.price >= state.filters.priceMin!);
    }
    if (state.filters.priceMax !== undefined) {
      result = result.filter((p) => p.price <= state.filters.priceMax!);
    }

    // Sort
    switch (state.filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating_desc':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // Assume products are already in newest-first order
        break;
    }

    return result;
  }, [state.products, state.filters]);

  return (
    <ProductContext.Provider
      value={{ state, filteredProducts, setFilter, setSort, loadProducts }}
    >
      {children}
    </ProductContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────

export function useProducts(): ProductContextValue {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
