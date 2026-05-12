import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import { AuthService } from '../services/authService';
import { TokenStore } from '../services/tokenStore';
import type { AuthState, User } from '../types';

// ── Action types ──────────────────────────────────────────

type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER'; payload: User }
  | { type: 'RESTORE_SESSION'; payload: User }
  | { type: 'SET_BOOTSTRAPPING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

// ── Initial state ─────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isBootstrapping: true,
  error: null,
};

// ── Reducer ───────────────────────────────────────────────

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
    case 'REGISTER':
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isBootstrapping: false,
      };
    case 'SET_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_BOOTSTRAPPING':
      return { ...state, isBootstrapping: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// ── JWT decode helper ─────────────────────────────────────

/**
 * Decode the payload segment of a JWT (base64url → JSON).
 * Returns the parsed payload or null if the token is malformed.
 *
 * Uses a manual base64 decoder since `atob` is not available in
 * the React Native JS environment.
 */
function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Base64url → standard base64
    const base64 = parts[1]!.replace(/-/g, '+').replace(/_/g, '/');
    // Pad to a multiple of 4
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '=',
    );

    // Manual base64 decode to a UTF-8 string
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let bytes = '';
    for (let i = 0; i < padded.length; i += 4) {
      const a = chars.indexOf(padded[i]!);
      const b = chars.indexOf(padded[i + 1]!);
      const c = chars.indexOf(padded[i + 2]!);
      const d = chars.indexOf(padded[i + 3]!);
      bytes += String.fromCharCode((a << 2) | (b >> 4));
      if (padded[i + 2] !== '=') bytes += String.fromCharCode(((b & 0xf) << 4) | (c >> 2));
      if (padded[i + 3] !== '=') bytes += String.fromCharCode(((c & 0x3) << 6) | d);
    }

    return JSON.parse(bytes) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ── Context ───────────────────────────────────────────────

interface AuthContextValue {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ── Bootstrap: restore session from secure storage on mount ──

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await TokenStore.getToken();
        if (token) {
          const payload = decodeJWTPayload(token);
          if (payload) {
            const user: User = {
              id: String(payload._id ?? payload.id ?? payload.sub ?? ''),
              fullName: String(payload.fullName ?? payload.name ?? ''),
              email: String(payload.email ?? ''),
              token,
            };
            dispatch({ type: 'RESTORE_SESSION', payload: user });
          }
        }
      } catch (error) {
        // Token read failed or invalid — remain unauthenticated
        console.error('Bootstrap error:', error);
      } finally {
        dispatch({ type: 'SET_BOOTSTRAPPING', payload: false });
      }
    };

    bootstrap();
  }, []);

  // ── Login ─────────────────────────────────────────────────

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'CLEAR_ERROR' });
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const { user, token } = await AuthService.login(email, password);
      await TokenStore.setToken(token);
      dispatch({ type: 'LOGIN', payload: { ...user, token } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred. Please try again.';
      dispatch({ type: 'SET_ERROR', payload: message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ── Register ──────────────────────────────────────────────

  const register = async (
    fullName: string,
    email: string,
    password: string,
  ): Promise<void> => {
    dispatch({ type: 'CLEAR_ERROR' });
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Register the account
      await AuthService.register(fullName, email, password);
      // Register API returns no token — immediately login to get one
      const { user, token } = await AuthService.login(email, password);
      await TokenStore.setToken(token);
      dispatch({ type: 'REGISTER', payload: { ...user, token } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred. Please try again.';
      dispatch({ type: 'SET_ERROR', payload: message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ── Logout ────────────────────────────────────────────────

  const logout = async (): Promise<void> => {
    try {
      await TokenStore.deleteToken();
    } catch (error) {
      // Log error but always proceed with logout
      console.error('Token deletion failed:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  // ── Clear error ───────────────────────────────────────────

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{ state, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
