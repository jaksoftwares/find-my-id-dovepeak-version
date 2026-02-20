'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
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

/**
 * Login user with email and password
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
        .select('id, full_name, email, role, avatar_url, phone_number')
        .eq('id', user?.id)
        .single();
      
      profile = result.data;
      profileError = result.error;
    } catch (e) {
      // Profile might not exist yet
      profileError = e;
    }

    // Create user profile - use profile if exists, otherwise fall back to auth data
    const userProfile: UserProfile = profile ? {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role || 'user',
      avatar_url: profile.avatar_url,
      phone_number: profile.phone_number,
    } : {
      id: user?.id!,
      email: user?.email!,
      full_name: user?.user_metadata?.full_name || 'User',
      role: 'user',
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
 * Register a new user
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

    // Update profile with phone number if provided
    if (userData.phone_number && data.user) {
      await supabase
        .from('profiles')
        .update({ phone_number: userData.phone_number })
        .eq('id', data.user.id);
    }

    // Fetch updated profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, avatar_url, phone_number')
      .eq('id', data.user?.id)
      .single();

    const userProfile: UserProfile = {
      id: data.user?.id!,
      email: data.user?.email!,
      full_name: profile?.full_name || userData.full_name,
      role: profile?.role || 'user',
      avatar_url: profile?.avatar_url,
      phone_number: profile?.phone_number,
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
 * Get current user profile
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
      .select('id, full_name, email, role, avatar_url, phone_number')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, create a user profile from auth data
    if (profileError || !profile) {
      // Return user with data from auth, not from profiles table
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || 'User',
          role: 'user', // Default role
          avatar_url: user.user_metadata?.avatar_url,
        },
      };
    }

    const userProfile: UserProfile = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      avatar_url: profile.avatar_url,
      phone_number: profile.phone_number,
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
 * Logout user
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
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
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
 * Update password (for logged-in users or via reset link)
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
 * Check if user has a specific role
 */
export function hasRole(user: UserProfile | null, requiredRole: string): boolean {
  if (!user) return false;
  
  if (requiredRole === 'admin') {
    return user.role === 'admin';
  }
  
  return true; // All authenticated users have 'user' role
}
