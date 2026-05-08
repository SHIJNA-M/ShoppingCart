import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from 'react';
import type { CartItem, CartState } from '../types';

// ── Action types ──────────────────────────────────────────

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; selectedSize: string; selectedColor: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; selectedSize: string; selectedColor: string; quantity: number } }
  | { type: 'CLEAR_CART' };

// ── Helpers ───────────────────────────────────────────────

function isSameItem(
  a: CartItem,
  b: { productId: string; selectedSize: string; selectedColor: string },
): boolean {
  return (
    a.productId === b.productId &&
    a.selectedSize === b.selectedSize &&
    a.selectedColor === b.selectedColor
  );
}

// ── Initial state ─────────────────────────────────────────

const initialState: CartState = {
  items: [],
};

// ── Reducer ───────────────────────────────────────────────

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.findIndex((item) =>
        isSameItem(item, action.payload),
      );
      if (existing !== -1) {
        const items = state.items.map((item, idx) =>
          idx === existing
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item,
        );
        return { items };
      }
      return { items: [...state.items, action.payload] };
    }

    case 'REMOVE_ITEM': {
      return {
        items: state.items.filter((item) => !isSameItem(item, action.payload)),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { quantity, ...key } = action.payload;
      if (quantity <= 0) {
        return { items: state.items.filter((item) => !isSameItem(item, key)) };
      }
      return {
        items: state.items.map((item) =>
          isSameItem(item, key) ? { ...item, quantity } : item,
        ),
      };
    }

    case 'CLEAR_CART':
      return { items: [] };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────

interface CartContextValue {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, selectedSize: string, selectedColor: string) => void;
  updateQuantity: (productId: string, selectedSize: string, selectedColor: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (item: CartItem): void => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (
    productId: string,
    selectedSize: string,
    selectedColor: string,
  ): void => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, selectedSize, selectedColor } });
  };

  const updateQuantity = (
    productId: string,
    selectedSize: string,
    selectedColor: string,
    quantity: number,
  ): void => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, selectedSize, selectedColor, quantity } });
  };

  const clearCart = (): void => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
