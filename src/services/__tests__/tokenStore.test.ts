/**
 * Tests for TokenStore
 * Feature: auth-login-registration
 *
 * Property tests:
 *   P10 — TokenStore round trip: setToken then getToken returns the same string
 *
 * Unit tests:
 *   - getToken returns null when no credentials are stored
 *   - setToken throws TokenStoreError on keychain write failure
 *   - getToken throws TokenStoreError on keychain read failure
 *   - deleteToken throws TokenStoreError on keychain delete failure
 *   - Uses the correct service key 'auth_token'
 */

import * as fc from 'fast-check';

// ── Manual mock for react-native-keychain ─────────────────
// We provide a factory so Jest creates proper mock functions
// (the package uses ESM and isn't auto-mockable via jest.mock alone)

const mockSetGenericPassword = jest.fn();
const mockGetGenericPassword = jest.fn();
const mockResetGenericPassword = jest.fn();

jest.mock('react-native-keychain', () => ({
  setGenericPassword: (...args: unknown[]) => mockSetGenericPassword(...args),
  getGenericPassword: (...args: unknown[]) => mockGetGenericPassword(...args),
  resetGenericPassword: (...args: unknown[]) => mockResetGenericPassword(...args),
}));

// Import AFTER mock is set up
import { TokenStore } from '../tokenStore';

const SERVICE_KEY = 'auth_token';

// ── Property tests ────────────────────────────────────────

describe('TokenStore — property tests', () => {
  beforeEach(() => jest.clearAllMocks());

  it('P10: setToken then getToken returns the same token string', async () => {
    // Feature: auth-login-registration, Property 10: TokenStore round trip
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 512 }),
        async (token) => {
          mockSetGenericPassword.mockResolvedValue({
            service: SERVICE_KEY,
            storage: 'keychain',
          });
          mockGetGenericPassword.mockResolvedValue({
            username: SERVICE_KEY,
            password: token,
            service: SERVICE_KEY,
            storage: 'keychain',
          });

          await TokenStore.setToken(token);
          const retrieved = await TokenStore.getToken();

          expect(retrieved).toBe(token);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── Unit tests ────────────────────────────────────────────

describe('TokenStore — unit tests', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getToken', () => {
    it('returns null when no credentials are stored (keychain returns false)', async () => {
      mockGetGenericPassword.mockResolvedValue(false);
      const result = await TokenStore.getToken();
      expect(result).toBeNull();
    });

    it('returns the stored token string when credentials exist', async () => {
      mockGetGenericPassword.mockResolvedValue({
        username: SERVICE_KEY,
        password: 'stored.jwt.token',
        service: SERVICE_KEY,
        storage: 'keychain',
      });

      const result = await TokenStore.getToken();
      expect(result).toBe('stored.jwt.token');
    });

    it('throws TokenStoreError with code STORAGE_ERROR on keychain read failure', async () => {
      mockGetGenericPassword.mockRejectedValue(new Error('Keychain unavailable'));

      await expect(TokenStore.getToken()).rejects.toMatchObject({
        code: 'STORAGE_ERROR',
        message: expect.any(String),
      });
    });

    it('uses the correct service key when reading', async () => {
      mockGetGenericPassword.mockResolvedValue(false);
      await TokenStore.getToken();
      expect(mockGetGenericPassword).toHaveBeenCalledWith({ service: SERVICE_KEY });
    });
  });

  describe('setToken', () => {
    it('stores the token using setGenericPassword with correct service key', async () => {
      mockSetGenericPassword.mockResolvedValue({
        service: SERVICE_KEY,
        storage: 'keychain',
      });

      await TokenStore.setToken('my.jwt');

      expect(mockSetGenericPassword).toHaveBeenCalledWith(
        SERVICE_KEY,
        'my.jwt',
        { service: SERVICE_KEY },
      );
    });

    it('throws TokenStoreError with code STORAGE_ERROR on keychain write failure', async () => {
      mockSetGenericPassword.mockRejectedValue(new Error('Write failed'));

      await expect(TokenStore.setToken('token')).rejects.toMatchObject({
        code: 'STORAGE_ERROR',
        message: expect.any(String),
      });
    });
  });

  describe('deleteToken', () => {
    it('calls resetGenericPassword with the correct service key', async () => {
      mockResetGenericPassword.mockResolvedValue(true);
      await TokenStore.deleteToken();
      expect(mockResetGenericPassword).toHaveBeenCalledWith({ service: SERVICE_KEY });
    });

    it('throws TokenStoreError with code STORAGE_ERROR on keychain delete failure', async () => {
      mockResetGenericPassword.mockRejectedValue(new Error('Delete failed'));

      await expect(TokenStore.deleteToken()).rejects.toMatchObject({
        code: 'STORAGE_ERROR',
        message: expect.any(String),
      });
    });
  });
});
