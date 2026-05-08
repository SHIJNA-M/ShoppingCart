import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../types/index';
import HomeStack from './HomeStack';
import CategoriesStack from './CategoriesStack';
import CartStack from './CartStack';
import ProfileScreen from '@screens/ProfileScreen';
import { Colors } from '@theme/tokens';
import { scale } from '../utils/scale';
import { useCart } from '@context/CartContext';

// SVG icons from assets
import HomeIcon    from '../assets/icons/Vector.svg';
import SearchIcon  from '../assets/icons/Union.svg';
import CartIcon    from '../assets/icons/shop cart 7.svg';
import ProfileIcon from '../assets/icons/Profile.svg';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICON_SIZE = scale(24);
const ACTIVE_COLOR   = Colors.black;
const INACTIVE_COLOR = '#AAAAAA';

function CartTabIcon({ focused }: { focused: boolean }) {
  const { state } = useCart();
  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <View>
      <CartIcon
        width={ICON_SIZE}
        height={ICON_SIZE}
        fill={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
      />
      {totalItems > 0 && (
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
        </View>
      )}
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Colors.white,
          borderTopWidth: 0,
          elevation: 12,
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
      }}
    >
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
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{
          tabBarIcon: ({ focused }) => <CartTabIcon focused={focused} />,
        }}
      />
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

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
  },
  badgeDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: '#E53935',
  },
});
