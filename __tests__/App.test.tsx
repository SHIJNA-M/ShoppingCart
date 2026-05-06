/**
 * Integration smoke test for App entry point.
 * Task 15.2 (optional): Verifies the app renders without crashing with all providers mounted.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

// Mock the entire navigation stack so we don't need native modules
jest.mock('../src/navigation/RootNavigator', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return function MockRootNavigator() {
    return React.createElement(Text, { testID: 'root-navigator' }, 'App');
  };
});

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

import App from '../App';

describe('App', () => {
  it('renders without crashing with all providers mounted', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('root-navigator')).toBeTruthy();
  });

  it('renders the NavigationContainer and RootNavigator', () => {
    const { getByText } = render(<App />);
    expect(getByText('App')).toBeTruthy();
  });
});
