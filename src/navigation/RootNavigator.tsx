/**
 * RootNavigator — auth guard
 * Reads `isAuthenticated` from AuthContext.
 * - Unauthenticated → renders AuthStack (Login / Registration)
 * - Authenticated    → renders MainTabs (Home / Categories / Wishlist / Profile)
 *
 * Uses conditional rendering (not `replace`) so auth screens are never
 * in the back stack after login — the entire navigator tree is swapped.
 *
 * Requirements: 7.3, 7.4
 */
import React from 'react';
import { useAuth } from '@context/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

export default function RootNavigator() {
  const { state } = useAuth();

  if (state.isAuthenticated) {
    return <MainTabs />;
  }

  return <AuthStack />;
}
