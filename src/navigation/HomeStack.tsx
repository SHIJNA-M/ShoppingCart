/**
 * HomeStack — authenticated product browsing flow
 * Stack navigator containing Category, ProductListing, and ProductDetail screens.
 * Requirements: 7.5, 7.6
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { HomeStackParamList } from '../types/index';
import CategoryScreen from '@screens/CategoryScreen';
import ProductListingScreen from '@screens/ProductListingScreen';
import ProductDetailScreen from '@screens/ProductDetailScreen';

const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName="Category"
      screenOptions={{
        headerShown: false,
        headerBackTitle: '',
        headerTintColor: '#000000',
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Stack.Screen
        name="Category"
        component={CategoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductListing"
        component={ProductListingScreen}
        options={({ route }) => ({ title: route.params.categoryName })}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
