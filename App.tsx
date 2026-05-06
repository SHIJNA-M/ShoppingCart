/**
 * App entry point
 *
 * Wraps the application in all context providers in the required order:
 *   ProductProvider → AuthProvider → CartProvider → WishlistProvider
 *   → NavigationContainer → RootNavigator
 *
 * Requirements: 7.1–7.6
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ProductProvider } from './src/context/ProductContext';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { WishlistProvider } from './src/context/WishlistContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <ProductProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ProductProvider>
  );
}
