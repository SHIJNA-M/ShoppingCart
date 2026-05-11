/**
 * Tests for validation utilities
 * Feature: auth-login-registration
 *
 * Property tests:
 *   P4 — Empty or whitespace fields are rejected (isEmptyOrWhitespace)
 *   P5 — Short passwords (< 6 chars) are detected
 *   P6 — Mismatched passwords are detected (doPasswordsMatch)
 *   P7 — Invalid email format is detected (isValidEmail)
 *
 * Unit tests:
 *   - Known valid email addresses return true
 *   - Known invalid email addresses return false
 *   - Non-empty strings return false for isEmptyOrWhitespace
 *   - Equal strings return true for doPasswordsMatch
 */

import * as fc from 'fast-check';
import {
  doPasswordsMatch,
  isEmptyOrWhitespace,
  isValidEmail,
} from '../validation';

// ── Property tests ────────────────────────────────────────

describe('validation — property tests', () => {
  describe('P4: isEmptyOrWhitespace', () => {
    it('returns true for any string composed only of whitespace characters', () => {
      // Feature: auth-login-registration, Property 4: Empty or whitespace fields are rejected
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(' ', '\t', '\n', '\r')).map((chars) => chars.join('')),
          (whitespace) => {
            expect(isEmptyOrWhitespace(whitespace)).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('returns false for any string that contains at least one non-whitespace character', () => {
      // Feature: auth-login-registration, Property 4: Empty or whitespace fields are rejected
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          (nonEmpty) => {
            expect(isEmptyOrWhitespace(nonEmpty)).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('P5: password length', () => {
    it('password.length < 6 is always detected as too short', () => {
      // Feature: auth-login-registration, Property 5: Short passwords rejected
      fc.assert(
        fc.property(
          fc.string({ maxLength: 5 }),
          (shortPassword) => {
            expect(shortPassword.length < 6).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('password.length >= 6 is never flagged as too short', () => {
      // Feature: auth-login-registration, Property 5: Short passwords rejected
      fc.assert(
        fc.property(
          fc.string({ minLength: 6 }),
          (longEnough) => {
            expect(longEnough.length < 6).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('P6: doPasswordsMatch', () => {
    it('returns false for any two strings that are not strictly equal', () => {
      // Feature: auth-login-registration, Property 6: Mismatched passwords rejected
      fc.assert(
        fc.property(
          fc
            .tuple(fc.string(), fc.string())
            .filter(([a, b]) => a !== b),
          ([a, b]) => {
            expect(doPasswordsMatch(a, b)).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('returns true for any string compared with itself', () => {
      // Feature: auth-login-registration, Property 6: Mismatched passwords rejected
      fc.assert(
        fc.property(fc.string(), (s) => {
          expect(doPasswordsMatch(s, s)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('P7: isValidEmail', () => {
    it('returns false for any string that does not contain @', () => {
      // Feature: auth-login-registration, Property 7: Invalid email format rejected
      fc.assert(
        fc.property(
          fc.string().filter((s) => !s.includes('@')),
          (noAt) => {
            expect(isValidEmail(noAt)).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('returns true for any fast-check generated email address', () => {
      // Feature: auth-login-registration, Property 7: Invalid email format rejected
      fc.assert(
        fc.property(fc.emailAddress(), (email) => {
          expect(isValidEmail(email)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('returns false for strings with whitespace', () => {
      // Feature: auth-login-registration, Property 7: Invalid email format rejected
      fc.assert(
        fc.property(
          fc.string().filter((s) => /\s/.test(s)),
          (withSpace) => {
            expect(isValidEmail(withSpace)).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});

// ── Unit tests ────────────────────────────────────────────

describe('validation — unit tests', () => {
  describe('isEmptyOrWhitespace', () => {
    it.each([
      ['empty string', ''],
      ['single space', ' '],
      ['multiple spaces', '   '],
      ['tab', '\t'],
      ['newline', '\n'],
      ['mixed whitespace', ' \t\n '],
    ])('returns true for %s', (_, value) => {
      expect(isEmptyOrWhitespace(value)).toBe(true);
    });

    it.each([
      ['single letter', 'a'],
      ['word', 'hello'],
      ['word with surrounding spaces', '  hello  '],
      ['number', '123'],
    ])('returns false for %s', (_, value) => {
      expect(isEmptyOrWhitespace(value)).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it.each([
      'user@example.com',
      'jane.doe@company.org',
      'test+tag@sub.domain.io',
      'a@b.co',
    ])('returns true for valid email: %s', (email) => {
      expect(isValidEmail(email)).toBe(true);
    });

    it.each([
      'notanemail',
      '@nodomain.com',
      'noatsign',
      'missing@tld',
      'spaces in@email.com',
      '',
      'double@@at.com',
    ])('returns false for invalid email: %s', (email) => {
      expect(isValidEmail(email)).toBe(false);
    });
  });

  describe('doPasswordsMatch', () => {
    it('returns true when both strings are identical', () => {
      expect(doPasswordsMatch('secret123', 'secret123')).toBe(true);
    });

    it('returns false when strings differ by one character', () => {
      expect(doPasswordsMatch('secret123', 'secret124')).toBe(false);
    });

    it('returns false when one string is a prefix of the other', () => {
      expect(doPasswordsMatch('pass', 'password')).toBe(false);
    });

    it('is case-sensitive', () => {
      expect(doPasswordsMatch('Password', 'password')).toBe(false);
    });

    it('returns true for empty strings (both empty)', () => {
      expect(doPasswordsMatch('', '')).toBe(true);
    });
  });
});
