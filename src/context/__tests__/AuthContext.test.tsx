/**
 * Tests for AuthContext / AuthProvider
 * Feature: auth-login-registration
 *
 * Property tests:
 *   P2  — Successful API response transitions to authenticated state
 *   P3  — API error response sets error state to message field
 *   P11 — Logout clears token and resets auth state
 *   P12 — Logout resets state even when token deletion fails
 *   P14 — Error is cleared when user calls clearError (simulates input change)
 *
 * Unit tests:
 *   - Bootstrap: token found → authenticated (RESTORE_SESSION)
 *   - Bootstrap: no token → unauthenticated, isBootstrapping false
 *   - Bootstrap: token read failure → unauthenticated, isBootstrapping false
 *   - isBootstrapping starts true, becomes false after bootstrap
 */

import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as fc from 'fast-check';
import { AuthProvider, useAuth } from '../AuthContext';
import { AuthService } from '../../services/authService';
import { TokenStore } from '../../services/tokenStore';

// ── Mocks ─────────────────────────────────────────────────

jest.mock('../../services/authService');
jest.mock('../../services/tokenStore');

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;
const mockTokenStore = TokenStore as jest.Mocked<typeof TokenStore>;

// ── Helpers ───────────────────────────────────────────────

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

/**
 * Build a minimal valid JWT with the given payload.
 * Not cryptographically signed — only used to test decoding logic.
 */
function makeJWT(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${header}.${body}.signature`;
}

// ── Property tests ────────────────────────────────────────

describe('AuthContext — property tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: no stored token (bootstrap resolves immediately)
    mockTokenStore.getToken.mockResolvedValue(null);
  });

  it('P2: successful login transitions to authenticated state for any valid user data', async () => {
    // Feature: auth-login-registration, Property 2: Successful API response → authenticated state
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.string({ minLength: 1 }),
          fullName: fc.string({ minLength: 1 }),
          email: fc.emailAddress(),
          token: fc.string({ minLength: 10 }),
        }),
        async (userData) => {
          mockTokenStore.setToken.mockResolvedValue(undefined);
          mockAuthService.login.mockResolvedValue({
            user: { id: userData.id, fullName: userData.fullName, email: userData.email },
            token: userData.token,
          });

          const { result } = renderHook(() => useAuth(), { wrapper });

          // Wait for bootstrap to finish
          await waitFor(() => expect(result.current.state.isBootstrapping).toBe(false));

          await act(async () => {
            await result.current.login(userData.email, 'password');
          });

          expect(result.current.state.isAuthenticated).toBe(true);
          expect(result.current.state.user?.id).toBe(userData.id);
          expect(result.current.state.user?.email).toBe(userData.email);
          expect(result.current.state.isLoading).toBe(false);
          expect(result.current.state.error).toBeNull();
        },
      ),
      { numRuns: 50 },
    );
  });

  it('P2: successful register transitions to authenticated state for any valid user data', async () => {
    // Feature: auth-login-registration, Property 2: Successful API response → authenticated state
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.string({ minLength: 1 }),
          fullName: fc.string({ minLength: 1 }),
          email: fc.emailAddress(),
          token: fc.string({ minLength: 10 }),
        }),
        async (userData) => {
          mockTokenStore.setToken.mockResolvedValue(undefined);
          mockAuthService.register.mockResolvedValue({
            user: { id: userData.id, fullName: userData.fullName, email: userData.email },
            token: userData.token,
          });

          const { result } = renderHook(() => useAuth(), { wrapper });
          await waitFor(() => expect(result.current.state.isBootstrapping).toBe(false));

          await act(async () => {
            await result.current.register(userData.fullName, userData.email, 'password');
          });

          expect(result.current.state.isAuthenticated).toBe(true);
          expect(result.current.state.isLoading).toBe(false);
          expect(result.current.state.error).toBeNull();
        },
      ),
      { numRuns: 50 },
    );
  });

  it('P3: API error sets error state to the message field for any error message', async () => {
    // Feature: auth-login-registration, Property 3: API error response → error state
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }),
        async (errorMessage) => {
          mockAuthService.login.mockRejectedValue(new Error(errorMessage));

          const { result } = renderHook(() => useAuth(), { wrapper });
          await waitFor(() => expect(result.current.state.isBootstrapping).toBe(false));

          await act(async () => {
            await result.current.login('a@b.com', 'pass');
          });

          expect(result.current.state.error).toBe(errorMessage);
          expect(result.current.state.isAuthenticated).toBe(false);
          expect(result.current.state.isLoading).toBe(false);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('P11: logout clears auth state for any authenticated session', async () => {
    // Feature: auth-login-registration, Property 11: Logout clears token and resets auth state
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.string({ minLength: 1 }),
          fullName: fc.string({ minLength: 1 }),
          email: fc.emailAddress(),
          token: fc.string({ minLength: 10 }),
        }),
        async (userData) => {
          mockTokenStore.setToken.mockResolvedValue(undefined);
          mockTokenStore.deleteToken.mockResolvedValue(undefined);
          mockAuthService.login.mockResolvedValue({
            user: { id: userData.id, fullName: userData.fullName, email: userData.email },
            token: userData.token,
          });

          const { result } = renderHook(() => useAuth(), { wrapper });
          await waitFor(() => expect(result.current.state.isBootstrapping).toBe(false));

          // Login first
          await act(async () => {
            await result.current.login(userData.email, 'password');
          });
          expect(result.current.state.isAuthenticated).toBe(true);

          // Then logout
          await act(async () => {
            await result.current.logout();
          });

          expect(result.current.state.isAuthenticated).toBe(false);
          expect(result.current.state.user).toBeNull();
          expect(mockTokenStore.deleteToken).toHaveBeenCalled();
        },
      ),
      { numRuns: 50 },
    );
  });

  it('P12: logout resets state even when token deletion throws', async () => {
    // Feature: auth-login-registration, Property 12: Logout resilient to storage failure
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        async (errorMessage) => {
          mockTokenStore.setToken.mockResolvedValue(undefined);
          mockTokenStore.deleteToken.mockRejectedValue(new Error(errorMessage));
          mockAuthService.login.mockResolvedValue({
            user: { id: '1', fullName: 'Test', email: 'a@b.com' },
            token: 'some.token',
          });

          const { result } = renderHook(() => useAuth(), { wrapper });
          await waitFor(() => expect(result.current.state.isBootstrapping).toBe(false));

          await act(async () => {
            await result.current.login('a@b.com', 'pass');
          });

          await act(async () => {
            await result.current.logout();
          });

          // State must be reset regardless of storage failure
          expect(result.current.state.isAuthenticated).toBe(false);
          expect(result.current.state.user).toBeNull();
        },
      ),
      { numRuns: 50 },
    );
  });

  it('P14: clearError sets error to null for any non-null error string', async () => {
    // Feature: auth-login-registration, Property 14: Error cleared on input change
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }),
        async (errorMessage) => {
          mockAuthService.login.mockRejectedValue(new Error(errorMessage));

          const { result } = renderHook(() => useAuth(), { wrapper });
          await waitFor(() => expect(result.current.state.isBootstrapping).toBe(false));

          // Trigger an error
          await act(async () => {
            await result.current.login('a@b.com', 'pass');
          });
          expect(result.current.state.error).toBe(errorMessage);

          // Clear it (simulates user editing an input field)
          act(() => {
            result.current.clearError();
          });

          expect(result.current.state.error).toBeNull();
        },
      ),
      { numRuns: 50 },
    );
  });
});

// ── Unit tests ────────────────────────────────────────────

describe('AuthContext — bootstrap unit tests', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts with isBootstrapping = true', () => {
    // Delay resolution so we can observe the initial state
    mockTokenStore.getToken.mockImplementation(
      () => new Promise(() => {}), // never resolves
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.state.isBootstrapping).toBe(true);
  });

  it('sets isBootstrapping = false after bootstrap completes with no token', async () => {
    mockTokenStore.getToken.mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.state.isBootstrapping).toBe(false));

    expect(result.current.state.isAuthenticated).toBe(false);
    expect(result.current.state.user).toBeNull();
  });

  it('restores session when a valid JWT is found in storage', async () => {
    const token = makeJWT({
      id: 'user-42',
      fullName: 'Alice',
      email: 'alice@example.com',
    });
    mockTokenStore.getToken.mockResolvedValue(token);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.state.isBootstrapping).toBe(false));

    expect(result.current.state.isAuthenticated).toBe(true);
    expect(result.current.state.user?.id).toBe('user-42');
    expect(result.current.state.user?.email).toBe('alice@example.com');
  });

  it('remains unauthenticated when token read throws', async () => {
    mockTokenStore.getToken.mockRejectedValue(new Error('Keychain error'));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.state.isBootstrapping).toBe(false));

    expect(result.current.state.isAuthenticated).toBe(false);
    expect(result.current.state.user).toBeNull();
  });

  it('isLoading is false after a failed login (loading state is cleared)', async () => {
    mockTokenStore.getToken.mockResolvedValue(null);
    mockAuthService.login.mockRejectedValue(new Error('Bad credentials'));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.state.isBootstrapping).toBe(false));

    await act(async () => {
      await result.current.login('a@b.com', 'wrong');
    });

    expect(result.current.state.isLoading).toBe(false);
  });
});
