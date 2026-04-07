'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Session Resolver - Centralized authentication and profile resolution
 * 
 * This module provides a unified authentication layer that:
 * - Consolidates auth logic from lib/auth.ts and app/lib/authService.ts
 * - Provides server-side request-cycle caching via React cache()
 * - Eliminates duplicate auth checks and profile queries
 * 
 * Usage:
 * - Server Components/API Routes: Use getSessionUser() from lib/auth.ts (cached)
 * - Client Components: Use authService.ts functions (login, register, logout)
 */

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storageKey: 'jkuat-auth-session',
      storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
    }
  }
);

// Types - shared across client and server
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'staff' | 'admin' | 'super_admin';
  avatar_url?: string;
  phone_number?: string;
  registration_number?: string;
  faculty?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  role: 'student' | 'staff';
  registration_number?: string;
  faculty?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    session: any;
    user: UserProfile;
  };
  error?: string;
}

// ============================================
// CLIENT-SIDE AUTHENTICATION (Browser)
// ============================================

/**
 * Login user with email and password - Client-side implementation
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return {
        success: false,
        message: error.message,
        error: error.message,
      };
    }

    // Fetch full profile with role
    let profile = null;
    let profileError = null;
    
    try {
      const result = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url, phone, registration_number, faculty')
        .eq('id', user?.id)
        .single();
      
      profile = result.data;
      profileError = result.error;
    } catch (e) {
      profileError = e;
    }

    const userProfile: UserProfile = profile ? {
      id: profile.id,
      email: user?.email || '',
      full_name: profile.full_name,
      role: profile.role || 'student',
      avatar_url: profile.avatar_url,
      phone_number: profile.phone,
      registration_number: profile.registration_number,
      faculty: profile.faculty,
    } : {
      id: user?.id!,
      email: user?.email!,
      full_name: user?.user_metadata?.full_name || 'User',
      role: (user?.user_metadata?.role as any) || 'student',
    };

    return {
      success: true,
      message: 'Login successful',
      data: {
        session,
        user: userProfile,
      },
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      error: error.message,
    };
  }
}

/**
 * Register a new user - Client-side implementation
 */
export async function register(userData: RegisterData): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name,
          phone_number: userData.phone_number,
          role: userData.role,
          registration_number: userData.registration_number,
          faculty: userData.faculty,
        },
      },
    });

    if (error) {
      return {
        success: false,
        message: error.message,
        error: error.message,
      };
    }

    if (data.user) {
      await supabase
        .from('profiles')
        .update({ 
          full_name: userData.full_name,
          phone: userData.phone_number,
          role: userData.role,
          registration_number: userData.registration_number,
          faculty: userData.faculty,
        })
        .eq('id', data.user.id);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url, phone, registration_number, faculty')
      .eq('id', data.user?.id)
      .single();

    const userProfile: UserProfile = {
      id: data.user?.id!,
      email: data.user?.email!,
      full_name: profile?.full_name || userData.full_name,
      role: profile?.role || (userData.role as any) || 'student',
      avatar_url: profile?.avatar_url,
      phone_number: profile?.phone || userData.phone_number,
      registration_number: profile?.registration_number || userData.registration_number,
      faculty: profile?.faculty || userData.faculty,
    };

    return {
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      data: {
        session: data.session,
        user: userProfile,
      },
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      error: error.message,
    };
  }
}

/**
 * Get current user profile - Client-side implementation
 */
export async function getCurrentUser(): Promise<{
  success: boolean;
  user?: UserProfile;
  error?: string;
}> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: authError?.message || 'Not authenticated',
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url, phone, registration_number, faculty')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile not found, logging out user:', profileError);
      await supabase.auth.signOut();
      
      return {
        success: false,
        error: 'Your account has been deactivated or removed.',
      };
    }

    const userProfile: UserProfile = {
      id: profile.id,
      email: user.email || '',
      full_name: profile.full_name,
      role: profile.role,
      avatar_url: profile.avatar_url,
      phone_number: profile.phone,
      registration_number: profile.registration_number,
      faculty: profile.faculty,
    };

    return {
      success: true,
      user: userProfile,
    };
  } catch (error: any) {
    console.error('Get current user error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Logout user - Client-side implementation
 */
export async function logout(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Request password reset - Client-side implementation
 */
export async function requestPasswordReset(email: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return {
        success: false,
        message: error.message,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Password reset instructions sent to your email.',
    };
  } catch (error: any) {
    console.error('Password reset request error:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      error: error.message,
    };
  }
}

/**
 * Resend verification email - Client-side implementation
 */
export async function resendVerification(email: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      }
    });

    if (error) {
      return {
        success: false,
        message: error.message,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Verification email resent successfully.',
    };
  } catch (error: any) {
    console.error('Resend verification error:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      error: error.message,
    };
  }
}

/**
 * Update password - Client-side implementation
 */
export async function updatePassword(newPassword: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        message: error.message,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Password updated successfully.',
    };
  } catch (error: any) {
    console.error('Update password error:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      error: error.message,
    };
  }
}

/**
 * Check if user has a specific role - Client-side implementation
 */
export function hasRole(user: UserProfile | null, requiredRole: string): boolean {
  if (!user) return false;
  
  if (requiredRole === 'super_admin') {
    return user.role === 'super_admin';
  }

  if (requiredRole === 'admin') {
    return user.role === 'admin' || user.role === 'super_admin';
  }

  if (requiredRole === 'staff') {
    return user.role === 'staff' || user.role === 'admin' || user.role === 'super_admin';
  }
  
  return true;
}