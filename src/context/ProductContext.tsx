import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  type ReactNode,
} from 'react';
import type { Product, Category, FilterState, SortOption } from '../types';
import { mockCategories } from '../data/mockCategories';
import { mockProducts } from '../data/mockProducts';

// ── State shape ───────────────────────────────────────────

interface ProductState {
  products: Product[];
  categories: Category[];
  filters: FilterState;
}

// ── Action types ──────────────────────────────────────────

type ProductAction =
  | { type: 'SET_FILTER'; payload: Partial<FilterState> }
  | { type: 'SET_SORT'; payload: SortOption }
  | { type: 'LOAD_PRODUCTS'; payload: Product[] };

// ── Initial state ─────────────────────────────────────────

const initialState: ProductState = {
  products: mockProducts,
  categories: mockCategories,
  filters: {
    categoryId: null,
    sortBy: 'newest',
  },
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
