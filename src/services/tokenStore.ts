import * as Keychain from 'react-native-keychain';

const SERVICE_KEY = 'auth_token';

export interface TokenStoreError {
  message: string;
  code: 'STORAGE_ERROR';
}

export const TokenStore = {
  /**
   * Store JWT token securely using react-native-keychain.
   * Service key: 'auth_token'
   * Throws: TokenStoreError on failure
   */
  setToken: async (token: string): Promise<void> => {
    try {
      await Keychain.setGenericPassword(SERVICE_KEY, token, {
        service: SERVICE_KEY,
      });
    } catch (error) {
      const err: TokenStoreError = {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to store token securely.',
        code: 'STORAGE_ERROR',
      };
      throw err;
    }
  },

  /**
   * Retrieve stored JWT token.
   * Returns: token string, or null if no credentials are stored.
   * Throws: TokenStoreError on read failure (but NOT when simply empty).
   */
  getToken: async (): Promise<string | null> => {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: SERVICE_KEY,
      });
      if (credentials === false) {
        // No credentials stored — return null, do not throw
        return null;
      }
      return credentials.password;
    } catch (error) {
      const err: TokenStoreError = {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to retrieve token from secure storage.',
        code: 'STORAGE_ERROR',
      };
      throw err;
    }
  },

  /**
   * Delete stored JWT token from secure storage.
   * Throws: TokenStoreError on delete failure
   */
  deleteToken: async (): Promise<void> => {
    try {
      await Keychain.resetGenericPassword({ service: SERVICE_KEY });
    } catch (error) {
      const err: TokenStoreError = {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to delete token from secure storage.',
        code: 'STORAGE_ERROR',
      };
      throw err;
    }
  },
};
