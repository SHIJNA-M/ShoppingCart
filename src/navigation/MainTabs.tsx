import React from 'react'; 
// React library for JSX

import { View, StyleSheet } from 'react-native'; // UI components and styling

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // Bottom tab navigator (used for bottom navigation bar)

import type { MainTabParamList } from '../types/index';
// TypeScript type for tab routes (ensures navigation safety)

import HomeStack from './HomeStack';
// Home screen stack (nested navigation inside Home tab)

import CategoriesStack from './CategoriesStack';
// Categories stack (nested navigation inside Categories tab)

import CartStack from './CartStack';
// Cart stack (handles cart + checkout screens)

import ProfileScreen from '@screens/ProfileScreen';
// Profile screen (simple screen, no stack)

import { Colors } from '@theme/tokens';
// App color constants

import { scale } from '../utils/scale';
// Utility function for responsive sizing

import { useCart } from '@context/CartContext';
// Global cart context (for cart items count)


// SVG icons
import HomeIcon from '../assets/icons/Vector.svg';
import SearchIcon from '../assets/icons/Union.svg';
import CartIcon from '../assets/icons/shop cart 7.svg';
import ProfileIcon from '../assets/icons/Profile.svg';


// Create Bottom Tab Navigator
const Tab = createBottomTabNavigator<MainTabParamList>();

// Icon size constant
const ICON_SIZE = scale(24);

// Colors for active/inactive tab icons
const ACTIVE_COLOR = Colors.black;
const INACTIVE_COLOR = '#AAAAAA';


// Custom Cart icon with badge (shows item count indicator)
function CartTabIcon({ focused }: { focused: boolean }) {

  const { state } = useCart(); 
  // Get cart data from global context

  const totalItems = state.items.reduce(
    (sum, i) => sum + i.quantity,
    0
  );
  // Calculate total items in cart

  return (
    <View>
      {/* Cart icon */}
      <CartIcon
        width={ICON_SIZE}
        height={ICON_SIZE}
        fill={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
      />

      {/* Badge (only show if cart has items) */}
      {totalItems > 0 && (
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
        </View>
      )}
    </View>
  );
}


// Main Bottom Tab Navigation
export default function MainTabs() {
  return (
    <Tab.Navigator

      initialRouteName="Home"
      // Default tab when app opens

      screenOptions={{

        headerShown: false,
        // Hide top header for all tabs

        tabBarShowLabel: false,
        // Hide text labels below icons

        tabBarActiveTintColor: ACTIVE_COLOR,
        // Active tab color

        tabBarInactiveTintColor: INACTIVE_COLOR,
        // Inactive tab color

        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Colors.white,
          borderTopWidth: 0,

          elevation: 12,
          // Android shadow

          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,

          height: scale(64),
          paddingBottom: scale(8),
          paddingTop: scale(8),

          borderTopLeftRadius: scale(20),
          borderTopRightRadius: scale(20),

          left: 0,
          right: 0,
          bottom: 0,
        },
        // Custom styled bottom tab bar
      }}
    >

      {/* Home Tab */}
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <HomeIcon
              width={ICON_SIZE}
              height={ICON_SIZE}
              fill={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
        }}
      />

      {/* Categories Tab */}
      <Tab.Screen
        name="Categories"
        component={CategoriesStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <SearchIcon
              width={ICON_SIZE}
              height={ICON_SIZE}
              fill={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
        }}
      />

      {/* Cart Tab */}
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <CartTabIcon focused={focused} />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <ProfileIcon
              width={ICON_SIZE}
              height={ICON_SIZE}
              fill={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
        }}
      />

    </Tab.Navigator>
  );
}


// Styles for cart badge
const styles = StyleSheet.create({

  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    // positions badge on top-right of cart icon
  },

  badgeDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: '#E53935',
    // red dot indicator
  },
});