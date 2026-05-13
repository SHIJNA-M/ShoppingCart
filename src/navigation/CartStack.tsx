import React from 'react'; 
// Import React (required for JSX)

import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Import stack navigator for native screen navigation (faster, native UI transitions)

import type { CartStackParamList } from '../types';
// TypeScript type for route params (helps with navigation safety)

import CartScreen from '@screens/CartScreen';
// Cart screen component

import CheckoutScreen from '@screens/CheckoutScreen';
// Checkout screen component

// Create stack navigator with typed routes
const Stack = createNativeStackNavigator<CartStackParamList>();

// CartStack component defines navigation flow for cart-related screens
export default function CartStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      // Hide default header for all screens in this stack
    >
      
      {/* First screen (default entry screen) */}
      <Stack.Screen
        name="CartMain"
        component={CartScreen}
      />

      {/* Checkout screen */}
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
      />

    </Stack.Navigator>
  );
}