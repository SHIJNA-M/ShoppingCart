import React, {
  createContext, // used to create global context (AuthContext)
  useContext, // used to consume context in components
  useEffect, // runs side effects (like API calls on mount)
  useReducer, // state management hook (like mini Redux)
  type ReactNode, // type for children prop
} from 'react';

import { AuthService } from '../services/authService'; // API calls (login/register)
import { TokenStore } from '../services/tokenStore'; // secure token storage (AsyncStorage/SecureStore)
import type { AuthState, User } from '../types'; // TypeScript types for auth state & user

// ── Action types ──────────────────────────────────────────

// Defines all possible actions for reducer
type AuthAction =
  | { type: 'LOGIN'; payload: User } // login action with user data
  | { type: 'LOGOUT' } // logout action
  | { type: 'REGISTER'; payload: User } // register action with user data
  | { type: 'RESTORE_SESSION'; payload: User } // restore saved login session
  | { type: 'SET_BOOTSTRAPPING'; payload: boolean } // loading initial session check
  | { type: 'SET_ERROR'; payload: string } // store error message
  | { type: 'SET_LOADING'; payload: boolean } // loading state
  | { type: 'CLEAR_ERROR' }; // clear error state

// ── Initial state ─────────────────────────────────────────

// Default auth state when app starts
const initialState: AuthState = {
  user: null, // no user logged in initially
  isAuthenticated: false, // user not logged in
  isLoading: false, // API loading state
  isBootstrapping: true, // checking stored token on app start
  error: null, // no error initially
};

// ── Reducer ───────────────────────────────────────────────

// Function that updates state based on action
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {

    // login/register/restore session success
    case 'LOGIN':
    case 'REGISTER':
    case 'RESTORE_SESSION':
      return {
        ...state, // keep previous state
        user: action.payload, // set user data
        isAuthenticated: true, // mark logged in
        isLoading: false, // stop loading
        error: null, // clear error
      };

    // logout resets state
    case 'LOGOUT':
      return {
        ...initialState, // reset everything
        isBootstrapping: false, // skip bootstrap after logout
      };

    // set error message
    case 'SET_ERROR':
      return { ...state, isLoading: false, error: action.payload };

    // set loading state
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    // set bootstrapping state
    case 'SET_BOOTSTRAPPING':
      return { ...state, isBootstrapping: action.payload };

    // clear error message
    case 'CLEAR_ERROR':
      return { ...state, error: null };

    // default return state if action unknown
    default:
      return state;
  }
}

// ── JWT decode helper ─────────────────────────────────────

/**
 * Decode JWT token payload (header.payload.signature)
 */
function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.'); // split JWT into 3 parts
    if (parts.length !== 3) return null; // invalid token check

    // convert base64url → base64 format
    const base64 = parts[1]!.replace(/-/g, '+').replace(/_/g, '/');

    // add padding if required
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '=',
    );

    // base64 character map
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    let bytes = '';

    // decode base64 manually
    for (let i = 0; i < padded.length; i += 4) {
      const a = chars.indexOf(padded[i]!);
      const b = chars.indexOf(padded[i + 1]!);
      const c = chars.indexOf(padded[i + 2]!);
      const d = chars.indexOf(padded[i + 3]!);

      // convert to ASCII characters
      bytes += String.fromCharCode((a << 2) | (b >> 4));

      if (padded[i + 2] !== '=')
        bytes += String.fromCharCode(((b & 0xf) << 4) | (c >> 2));

      if (padded[i + 3] !== '=')
        bytes += String.fromCharCode(((c & 0x3) << 6) | d);
    }

    // convert string → JSON object
    return JSON.parse(bytes) as Record<string, unknown>;
  } catch {
    return null; // return null if decoding fails
  }
}

// ── Context ───────────────────────────────────────────────

// Type of values shared globally
interface AuthContextValue {
  state: AuthState; // auth state
  login: (email: string, password: string) => Promise<void>; // login function
  register: (fullName: string, email: string, password: string) => Promise<void>; // register function
  logout: () => Promise<void>; // logout function
  clearError: () => void; // clear error function
}

// Create context (initially undefined)
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────

// Props type for provider
interface AuthProviderProps {
  children: ReactNode; // components wrapped inside provider
}

// AuthProvider wraps entire app
export function AuthProvider({ children }: AuthProviderProps) {

  // useReducer for auth state management
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ── Bootstrap session (run on app start) ──
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await TokenStore.getToken(); // get saved token

        if (token) {
          const payload = decodeJWTPayload(token); // decode token

          if (payload) {
            const user: User = {
              id: String(payload._id ?? payload.id ?? payload.sub ?? ''), // user id
              fullName: String(payload.fullName ?? payload.name ?? ''), // name
              email: String(payload.email ?? ''), // email
              token, // attach token
            };

            // restore session
            dispatch({ type: 'RESTORE_SESSION', payload: user });
          }
        }
      } catch (error) {
        console.error('Bootstrap error:', error); // log error
      } finally {
        // stop bootstrapping loader
        dispatch({ type: 'SET_BOOTSTRAPPING', payload: false });
      }
    };

    bootstrap(); // run on mount
  }, []);

  // ── Login function ────────────────────────────────
  const login = async (email: string, password: string) => {
    dispatch({ type: 'CLEAR_ERROR' }); // remove old errors
    dispatch({ type: 'SET_LOADING', payload: true }); // start loading

    try {
      const { user, token } = await AuthService.login(email, password); // API call

      await TokenStore.setToken(token); // save token

      dispatch({ type: 'LOGIN', payload: { ...user, token } }); // update state
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'An error occurred. Please try again.';

      dispatch({ type: 'SET_ERROR', payload: message }); // set error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false }); // stop loading
    }
  };

  // ── Register function ─────────────────────────────
  const register = async (fullName: string, email: string, password: string) => {
    dispatch({ type: 'CLEAR_ERROR' });
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await AuthService.register(fullName, email, password); // register API

      // login after register (to get token)
      const { user, token } = await AuthService.login(email, password);

      await TokenStore.setToken(token); // store token

      dispatch({ type: 'REGISTER', payload: { ...user, token } }); // update state
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'An error occurred. Please try again.';

      dispatch({ type: 'SET_ERROR', payload: message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ── Logout function ───────────────────────────────
  const logout = async () => {
    try {
      await TokenStore.deleteToken(); // remove token from storage
    } catch (error) {
      console.error('Token deletion failed:', error);
    } finally {
      dispatch({ type: 'LOGOUT' }); // reset auth state
    }
  };

  // ── Clear error ───────────────────────────────────
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' }); // remove error message
  };

  return (
    <AuthContext.Provider
      value={{ state, login, register, logout, clearError }} // expose values
    >
      {children} {/* wrap app */}
    </AuthContext.Provider>
  );
}

// ── Custom hook ────────────────────────────────────

// Hook to use auth context easily
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext); // get context

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context; // return auth data
}