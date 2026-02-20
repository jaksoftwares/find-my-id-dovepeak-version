'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { 
  User as SupabaseUser, 
  Session 
} from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { 
  login as authLogin, 
  register as authRegister, 
  logout as authLogout, 
  getCurrentUser,
  UserProfile,
  LoginCredentials,
  RegisterData
} from '@/app/lib/authService';

// Auth Context Types
interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  hasRole: (role: string) => boolean;
  isAdmin: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useRef(false);

  // Create Supabase client - only once
  const supabase = useRef(
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  // Check for existing session on mount - simplified
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initializeAuth = async () => {
      try {
        // Get session
        const { data: { session: currentSession } } = await supabase.current.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          
          // Get user profile
          const result = await getCurrentUser();
          if (result.success && result.user) {
            setUser(result.user);
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authLogin(credentials);
      
      if (result.success && result.data) {
        setUser(result.data.user);
        setSession(result.data.session);
        setIsLoading(false);
        return { success: true, message: result.message };
      } else {
        const errorMessage = result.message || 'Login failed';
        setError(errorMessage);
        setIsLoading(false);
        return { success: false, message: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Register function
  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authRegister(data);
      
      if (result.success && result.data) {
        setUser(result.data.user);
        setSession(result.data.session);
        setIsLoading(false);
        return { success: true, message: result.message };
      } else {
        const errorMessage = result.message || 'Registration failed';
        setError(errorMessage);
        setIsLoading(false);
        return { success: false, message: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authLogout();
      setUser(null);
      setSession(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if user has a specific role
  const hasRole = useCallback((role: string): boolean => {
    if (!user) return false;
    
    if (role === 'admin') {
      return user.role === 'admin';
    }
    
    return true;
  }, [user]);

  const isAdmin = user?.role === 'admin';

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    hasRole,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Export the context for testing
export { AuthContext };
