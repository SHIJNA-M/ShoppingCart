/**
 * Validation utilities for form fields.
 * All functions are pure with no side effects.
 */

/**
 * Returns true if the string is empty or contains only whitespace characters.
 * Used to validate required fields on Login and Registration screens.
 * Validates: Requirements 1.4, 2.4
 */
export function isEmptyOrWhitespace(value: string): boolean {
  return value.trim().length === 0;
}

/**
 * Returns true if both strings are strictly equal.
 * Used to validate that password and confirm-password fields match.
 * Validates: Requirements 2.5
 */
export function doPasswordsMatch(a: string, b: string): boolean {
  return a === b;
}

/**
 * Returns true if the string matches a valid email format.
 * Checks for the pattern: local-part @ domain . tld
 * Used to validate the email field on the Login screen.
 * Validates: Requirements 1.4
 */
export function isValidEmail(value: string): boolean {
  // RFC 5322-inspired pattern: local@domain.tld
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}
