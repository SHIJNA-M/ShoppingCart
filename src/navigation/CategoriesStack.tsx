/**
 * CategoriesStack — stack navigator for the Categories tab
 * Allows navigation from CategoryScreen → ProductListing → ProductDetail
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { HomeStackParamList } from '../types/index';
import CategoryScreen from '@screens/CategoryScreen';
import ProductListingScreen from '@screens/ProductListingScreen';
import ProductDetailScreen from '@screens/ProductDetailScreen';

const Stack = createStackNavigator<HomeStackParamList>();

export default function CategoriesStack() {
  return (
    <Stack.Navigator
      initialRouteName="Category"
      screenOptions={{
        headerShown: true,
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
        options={{ title: 'Categories' }}
      />
      <Stack.Screen
        name="ProductListing"
        component={ProductListingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
