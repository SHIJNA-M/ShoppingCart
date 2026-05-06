import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from 'react';
import type { AuthState, User } from '../types';

// ── Action types ──────────────────────────────────────────

type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER'; payload: User }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

// ── Initial state ─────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// ── Reducer ───────────────────────────────────────────────

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
    case 'REGISTER':
      return {
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT':
      return { ...initialState };
    case 'SET_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────

interface AuthContextValue {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (email: string, password: string): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Email and password are required.' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    // Simulate async operation (mock — no real backend)
    await new Promise<void>((resolve) => setTimeout(resolve, 300));

    const mockUser: User = {
      id: `user-${Date.now()}`,
      fullName: 'Mock User',
      username: email.split('@')[0] ?? 'user',
      email,
    };

    dispatch({ type: 'LOGIN', payload: mockUser });
  };

  const register = async (
    fullName: string,
    username: string,
    email: string,
    password: string,
  ): Promise<void> => {
    if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'All fields are required.' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    // Simulate async operation (mock — no real backend)
    await new Promise<void>((resolve) => setTimeout(resolve, 300));

    const mockUser: User = {
      id: `user-${Date.now()}`,
      fullName,
      username,
      email,
    };

    dispatch({ type: 'REGISTER', payload: mockUser });
  };

  const logout = (): void => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, register, logout }}>
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
