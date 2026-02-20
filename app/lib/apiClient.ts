import { createBrowserClient } from '@supabase/ssr';

/**
 * API Client for making authenticated requests
 * Uses Supabase client for authentication state management
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Custom fetch wrapper that handles Supabase authentication
 */
export async function authFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get the current session
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error);
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if session exists
  if (session?.access_token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${session.access_token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  return response;
}

/**
 * Check if user is authenticated
 */
export async function checkAuth(): Promise<{
  authenticated: boolean;
  user?: any;
  session?: any;
}> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return { authenticated: false };
  }

  // Get user data
  const { data: { user } } = await supabase.auth.getUser();

  return {
    authenticated: true,
    user,
    session,
  };
}

/**
 * Refresh the session
 */
export async function refreshSession(): Promise<{
  success: boolean;
  session?: any;
  error?: string;
}> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { session }, error } = await supabase.auth.refreshSession();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, session };
}

/**
 * Sign out the user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
