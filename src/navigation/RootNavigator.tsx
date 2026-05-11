/**
 * RootNavigator — auth guard
 * Reads `isAuthenticated` and `isBootstrapping` from AuthContext.
 * - Bootstrapping     → renders a centered ActivityIndicator (session restore in progress)
 * - Unauthenticated   → renders AuthStack (Login / Registration)
 * - Authenticated     → renders MainTabs (Home / Categories / Wishlist / Profile)
 *
 * Uses conditional rendering (not `replace`) so auth screens are never
 * in the back stack after login — the entire navigator tree is swapped.
 *
 * Requirements: 7.3, 7.4
 */
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@context/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

export default function RootNavigator() {
  const { state } = useAuth();

  if (state.isBootstrapping) {
    return (
      <View
        testID="bootstrap-loader"
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (state.isAuthenticated) {
    return <MainTabs />;
  }

  return <AuthStack />;
}
