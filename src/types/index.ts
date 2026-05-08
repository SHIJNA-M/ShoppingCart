import type { NavigatorScreenParams } from '@react-navigation/native';

// ── Auth ──────────────────────────────────────────────────

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ── Products ──────────────────────────────────────────────

export interface ColorOption { 
  label: string;
  hex: string;
  imageIndex?: number; // which image index corresponds to this color
}

export interface Product {
  id: string;
  name: string;
  price: number;
  images: (string | number)[];  // string = URI, number = local require()
  colorOptions: ColorOption[];
  sizeOptions: string[];
  description: string;
  rating: number;
  reviewCount: number;
  categoryId: string;
  similarProductIds: string[];
}

// ── Categories ────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  imageUrl: string | number;  // string = URI, number = local require()
  imgWidth?: number;
  imgHeight?: number;
  top?: number;
  left?: number;
}

// ── Cart ──────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

// ── Wishlist ──────────────────────────────────────────────

export interface WishlistState {
  productIds: Set<string>;
}

// ── Filter / Sort ─────────────────────────────────────────

export type SortOption = 'price_asc' | 'price_desc' | 'rating_desc' | 'newest';

export interface FilterState {
  categoryId: string | null;
  sortBy: SortOption;
  priceMin?: number;
  priceMax?: number;
  sizes?: string[];
  colors?: string[];
}

// ── Social Auth ───────────────────────────────────────────

export type SocialProvider = 'Apple' | 'Google' | 'Facebook';

// ── Navigation Params ─────────────────────────────────────

export type RootStackParamList = {
  Login: undefined;
  Registration: undefined;
};

export type HomeStackParamList = {
  Category: undefined;
  ProductListing: { categoryId: string; categoryName: string };
  ProductDetail: { productId: string };
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Categories: undefined;
  Cart: NavigatorScreenParams<CartStackParamList>;
  Profile: undefined;
};

export type CartStackParamList = {
  CartMain: undefined;
  Checkout: { total: number };
};
