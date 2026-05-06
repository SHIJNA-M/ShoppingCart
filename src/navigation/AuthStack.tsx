/**
 * AuthStack — unauthenticated flow
 * Stack navigator containing Login and Registration screens.
 * Requirements: 7.1
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { RootStackParamList } from '../types/index';
import LoginScreen from '@screens/auth/LoginScreen';
import RegistrationScreen from '@screens/auth/RegistrationScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Registration" component={RegistrationScreen} />
    </Stack.Navigator>
  );
}
