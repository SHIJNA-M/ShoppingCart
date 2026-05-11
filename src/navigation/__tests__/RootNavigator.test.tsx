/**
 * Tests for RootNavigator
 * Feature: auth-login-registration
 *
 * Property tests:
 *   P13 — RootNavigator renders correct stack based on auth state:
 *         isBootstrapping=true  → loading indicator
 *         isAuthenticated=true  → MainTabs
 *         isAuthenticated=false → AuthStack (Login)
 *
 * Unit tests:
 *   - Shows ActivityIndicator while bootstrapping
 *   - Shows AuthStack when not authenticated and not bootstrapping
 *   - Shows MainTabs when authenticated
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import * as fc from 'fast-check';
import { NavigationContainer } from '@react-navigation/native';

// ── Mocks ─────────────────────────────────────────────────

// Mock AuthContext so we can inject arbitrary state
jest.mock('@context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Lightweight stand-ins for the two navigator trees
jest.mock('../AuthStack', () => {
  const { View, Text } = require('react-native');
  return () => (
    <View testID="auth-stack">
      <Text>Login</Text>
    </View>
  );
});

jest.mock('../MainTabs', () => {
  const { View, Text } = require('react-native');
  return () => (
    <View testID="main-tabs">
      <Text>Home</Text>
    </View>
  );
});

import { useAuth } from '@context/AuthContext';
import RootNavigator from '../RootNavigator';

const mockUseAuth = useAuth as jest.Mock;

function renderNavigator() {
  return render(
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>,
  );
}

// ── Property tests ────────────────────────────────────────

describe('RootNavigator — property tests', () => {
  it('P13: renders loading indicator for any state where isBootstrapping is true', () => {
    // Feature: auth-login-registration, Property 13: RootNavigator renders correct stack
    fc.assert(
      fc.property(
        fc.boolean(), // isAuthenticated — irrelevant when bootstrapping
        (isAuthenticated) => {
          mockUseAuth.mockReturnValue({
            state: { isBootstrapping: true, isAuthenticated },
          });

          const { getByTestId, queryByTestId } = renderNavigator();

          expect(getByTestId('bootstrap-loader')).toBeTruthy();
          expect(queryByTestId('auth-stack')).toBeNull();
          expect(queryByTestId('main-tabs')).toBeNull();
        },
      ),
      { numRuns: 20 },
    );
  });

  it('P13: renders MainTabs for any state where isAuthenticated=true and not bootstrapping', () => {
    // Feature: auth-login-registration, Property 13: RootNavigator renders correct stack
    fc.assert(
      fc.property(
        fc.constant(false), // isBootstrapping always false here
        (_) => {
          mockUseAuth.mockReturnValue({
            state: { isBootstrapping: false, isAuthenticated: true },
          });

          const { getByTestId, queryByTestId } = renderNavigator();

          expect(getByTestId('main-tabs')).toBeTruthy();
          expect(queryByTestId('auth-stack')).toBeNull();
          expect(queryByTestId('bootstrap-loader')).toBeNull();
        },
      ),
      { numRuns: 20 },
    );
  });

  it('P13: renders AuthStack for any state where isAuthenticated=false and not bootstrapping', () => {
    // Feature: auth-login-registration, Property 13: RootNavigator renders correct stack
    fc.assert(
      fc.property(
        fc.constant(false),
        (_) => {
          mockUseAuth.mockReturnValue({
            state: { isBootstrapping: false, isAuthenticated: false },
          });

          const { getByTestId, queryByTestId } = renderNavigator();

          expect(getByTestId('auth-stack')).toBeTruthy();
          expect(queryByTestId('main-tabs')).toBeNull();
          expect(queryByTestId('bootstrap-loader')).toBeNull();
        },
      ),
      { numRuns: 20 },
    );
  });
});

// ── Unit tests ────────────────────────────────────────────

describe('RootNavigator — unit tests', () => {
  it('shows ActivityIndicator (bootstrap-loader) while isBootstrapping is true', () => {
    mockUseAuth.mockReturnValue({
      state: { isBootstrapping: true, isAuthenticated: false },
    });

    const { getByTestId } = renderNavigator();
    expect(getByTestId('bootstrap-loader')).toBeTruthy();
  });

  it('shows AuthStack when not authenticated and bootstrap is complete', () => {
    mockUseAuth.mockReturnValue({
      state: { isBootstrapping: false, isAuthenticated: false },
    });

    const { getByTestId } = renderNavigator();
    expect(getByTestId('auth-stack')).toBeTruthy();
  });

  it('shows MainTabs when authenticated and bootstrap is complete', () => {
    mockUseAuth.mockReturnValue({
      state: { isBootstrapping: false, isAuthenticated: true },
    });

    const { getByTestId } = renderNavigator();
    expect(getByTestId('main-tabs')).toBeTruthy();
  });

  it('does not render both AuthStack and MainTabs at the same time', () => {
    mockUseAuth.mockReturnValue({
      state: { isBootstrapping: false, isAuthenticated: true },
    });

    const { queryByTestId } = renderNavigator();
    expect(queryByTestId('auth-stack')).toBeNull();
  });
});
