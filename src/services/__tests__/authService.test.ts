/**
 * Tests for AuthService
 * Feature: auth-login-registration
 *
 * Property tests:
 *   P1 — AuthService constructs correct requests for all auth endpoints
 *   P9 — Network and timeout errors clear loading state (error message is non-empty)
 *
 * Unit tests:
 *   - Exact login URL, method, headers, body
 *   - Exact register URL, method, headers, body
 *   - Timeout after 10 s (AbortError → timeout message)
 *   - Network failure (TypeError → network message)
 *   - API error response (success: false → throws with message field)
 */

import * as fc from 'fast-check';
import { AuthService } from '../authService';

// ── Helpers ───────────────────────────────────────────────

const BASE_URL = 'http://144.202.25.149/skeleton/api/v1';

function makeSuccessResponse(
  email: string,
  overrides: Partial<{ id: string; fullName: string; token: string }> = {},
) {
  return {
    ok: true,
    json: async () => ({
      success: true,
      data: {
        id: overrides.id ?? 'user-1',
        fullName: overrides.fullName ?? 'Test User',
        email,
        token: overrides.token ?? 'jwt.token.here',
      },
    }),
  };
}

function mockFetchWith(response: object) {
  const fn = jest.fn().mockResolvedValue(response);
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

// ── Property tests ────────────────────────────────────────

describe('AuthService — property tests', () => {
  afterEach(() => jest.restoreAllMocks());

  it('P1: login constructs correct request for all valid email/password inputs', async () => {
    // Feature: auth-login-registration, Property 1: AuthService constructs correct requests
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 6, maxLength: 64 }),
        async (email, password) => {
          const mockFetch = mockFetchWith(makeSuccessResponse(email));

          await AuthService.login(email, password);

          expect(mockFetch).toHaveBeenCalledTimes(1);
          const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];

          expect(url).toBe(`${BASE_URL}/users/login`);
          expect(options.method).toBe('POST');
          expect((options.headers as Record<string, string>)['Content-Type']).toBe(
            'application/json',
          );
          const body = JSON.parse(options.body as string);
          expect(body.email).toBe(email);
          expect(body.password).toBe(password);
          // login must NOT send fullName
          expect(body.fullName).toBeUndefined();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('P1: register constructs correct request for all valid inputs', async () => {
    // Feature: auth-login-registration, Property 1: AuthService constructs correct requests
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.emailAddress(),
        fc.string({ minLength: 6, maxLength: 64 }),
        async (fullName, email, password) => {
          const mockFetch = mockFetchWith(makeSuccessResponse(email, { fullName }));

          await AuthService.register(fullName, email, password);

          expect(mockFetch).toHaveBeenCalledTimes(1);
          const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];

          expect(url).toBe(`${BASE_URL}/users/register`);
          expect(options.method).toBe('POST');
          expect((options.headers as Record<string, string>)['Content-Type']).toBe(
            'application/json',
          );
          const body = JSON.parse(options.body as string);
          expect(body.fullName).toBe(fullName);
          expect(body.email).toBe(email);
          expect(body.password).toBe(password);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('P9: network errors produce non-empty error message', async () => {
    // Feature: auth-login-registration, Property 9: Network and timeout errors clear loading state
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 6 }),
        async (email, password) => {
          global.fetch = jest.fn().mockRejectedValue(
            new TypeError('Network request failed'),
          ) as unknown as typeof fetch;

          await expect(AuthService.login(email, password)).rejects.toThrow(
            expect.objectContaining({ message: expect.stringMatching(/.+/) }),
          );
        },
      ),
      { numRuns: 50 },
    );
  });

  it('P9: API error responses produce non-empty error message', async () => {
    // Feature: auth-login-registration, Property 9: Network and timeout errors clear loading state
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }),
        async (apiMessage) => {
          global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ success: false, message: apiMessage }),
          }) as unknown as typeof fetch;

          await expect(AuthService.login('a@b.com', 'password')).rejects.toThrow(
            expect.objectContaining({ message: expect.stringMatching(/.+/) }),
          );
        },
      ),
      { numRuns: 50 },
    );
  });
});

// ── Unit tests ────────────────────────────────────────────

describe('AuthService — unit tests', () => {
  afterEach(() => jest.restoreAllMocks());

  describe('login', () => {
    it('posts to the exact login URL', async () => {
      const mockFetch = mockFetchWith(makeSuccessResponse('user@example.com'));
      await AuthService.login('user@example.com', 'secret123');
      expect(mockFetch.mock.calls[0][0]).toBe(`${BASE_URL}/users/login`);
    });

    it('returns user and token on success', async () => {
      mockFetchWith({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'abc',
            fullName: 'Jane Doe',
            email: 'jane@example.com',
            token: 'my.jwt.token',
          },
        }),
      });

      const result = await AuthService.login('jane@example.com', 'pass123');
      expect(result.user).toEqual({
        id: 'abc',
        fullName: 'Jane Doe',
        email: 'jane@example.com',
      });
      expect(result.token).toBe('my.jwt.token');
    });

    it('throws with API message when success is false', async () => {
      mockFetchWith({
        ok: true,
        json: async () => ({ success: false, message: 'Invalid credentials' }),
      });

      await expect(AuthService.login('a@b.com', 'wrong')).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('throws network message on TypeError (fetch failure)', async () => {
      global.fetch = jest.fn().mockRejectedValue(
        new TypeError('Network request failed'),
      ) as unknown as typeof fetch;

      await expect(AuthService.login('a@b.com', 'pass')).rejects.toThrow(
        'Unable to connect. Please check your internet connection.',
      );
    });

    it('throws timeout message when AbortController fires', async () => {
      jest.useFakeTimers();

      global.fetch = jest.fn().mockImplementation(
        (_url: string, options: RequestInit) =>
          new Promise((_resolve, reject) => {
            // Simulate the signal aborting with an AbortError
            options.signal?.addEventListener('abort', () => {
              const err = new Error('Aborted');
              err.name = 'AbortError';
              reject(err);
            });
          }),
      ) as unknown as typeof fetch;

      const loginPromise = AuthService.login('a@b.com', 'pass');
      jest.advanceTimersByTime(10_001);

      await expect(loginPromise).rejects.toThrow(
        'Request timed out. Please try again.',
      );

      jest.useRealTimers();
    });
  });

  describe('register', () => {
    it('posts to the exact register URL', async () => {
      const mockFetch = mockFetchWith(
        makeSuccessResponse('new@example.com', { fullName: 'New User' }),
      );
      await AuthService.register('New User', 'new@example.com', 'pass123');
      expect(mockFetch.mock.calls[0][0]).toBe(`${BASE_URL}/users/register`);
    });

    it('returns user and token on success', async () => {
      mockFetchWith({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'xyz',
            fullName: 'John Smith',
            email: 'john@example.com',
            token: 'register.jwt',
          },
        }),
      });

      const result = await AuthService.register(
        'John Smith',
        'john@example.com',
        'pass123',
      );
      expect(result.user.fullName).toBe('John Smith');
      expect(result.token).toBe('register.jwt');
    });

    it('throws with API message when success is false', async () => {
      mockFetchWith({
        ok: true,
        json: async () => ({
          success: false,
          message: 'Email already registered',
        }),
      });

      await expect(
        AuthService.register('Jane', 'jane@example.com', 'pass123'),
      ).rejects.toThrow('Email already registered');
    });

    it('throws network message on TypeError', async () => {
      global.fetch = jest.fn().mockRejectedValue(
        new TypeError('Failed to fetch'),
      ) as unknown as typeof fetch;

      await expect(
        AuthService.register('Jane', 'jane@example.com', 'pass123'),
      ).rejects.toThrow(
        'Unable to connect. Please check your internet connection.',
      );
    });
  });
});
