import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from 'react';
import type { WishlistState } from '../types';

// ── Action types ──────────────────────────────────────────

type WishlistAction = { type: 'TOGGLE_WISHLIST'; payload: string };

// ── Initial state ─────────────────────────────────────────

const initialState: WishlistState = {
  productIds: new Set<string>(),
};

// ── Reducer ───────────────────────────────────────────────

export function wishlistReducer(
  state: WishlistState,
  action: WishlistAction,
): WishlistState {
  switch (action.type) {
    case 'TOGGLE_WISHLIST': {
      const next = new Set(state.productIds);
      if (next.has(action.payload)) {
        next.delete(action.payload);
      } else {
        next.add(action.payload);
      }
      return { productIds: next };
    }
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────

interface WishlistContextValue {
  state: WishlistState;
  toggleWishlist: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────

interface WishlistProviderProps {
  children: ReactNode;
}

export function WishlistProvider({ children }: WishlistProviderProps) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  const toggleWishlist = (productId: string): void => {
    dispatch({ type: 'TOGGLE_WISHLIST', payload: productId });
  };

  return (
    <WishlistContext.Provider value={{ state, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
