import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";
import { NextResponse } from "next/server";

export type UserProfile = Database['public']['Tables']['profiles']['Row'];

/**
 * Session Resolver - Server-Side Authentication with Request-Cycle Caching
 * 
 * This module provides the server-side authentication layer with React cache()
 * for request-cycle deduplication. Multiple calls within the same render/request
 * cycle will only execute once.
 * 
 * Key features:
 * - Request-cycle caching via React cache() - eliminates duplicate DB queries
 * - Unified auth logic from both lib/auth.ts and app/lib/authService.ts
 * - All helper functions (requireAuth, requireAdmin, isAdminRole, etc.) preserved
 * - Backward compatible - same exports as before
 */

type SessionData = { user: any; profile: UserProfile };

/**
 * Cached session user retrieval - executes only once per request cycle
 * Use this for server components and API routes
 */
export const getSessionUser = cache(async (): Promise<SessionData | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Fetch profile to get role and other data
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Profile fetch error:", profileError);
    return null;
  }

  return { user, profile };
});

/**
 * Require authentication - returns error response if not authenticated
 * Uses cached getSessionUser for deduplication
 */
export async function requireAuth() {
  const session = await getSessionUser();
  if (!session) {
    return { error: NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }) };
  }
  return { session };
}

/**
 * Check if role is admin-level
 */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin" || role === "super_admin";
}

/**
 * Check if role is super_admin
 */
export function isSuperAdminRole(role: string | null | undefined): boolean {
  return role === "super_admin";
}

/**
 * Require admin role - returns error response if not admin
 * Uses cached getSessionUser for deduplication
 */
export async function requireAdmin() {
  const session = await getSessionUser();
  
  if (!session) {
    return { error: NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }) };
  }

  if (!isAdminRole(session.profile.role)) {
    return { error: NextResponse.json({ success: false, message: "Forbidden: Administrative access required" }, { status: 403 }) };
  }

  return { session };
}

/**
 * Require super_admin role - returns error response if not super_admin
 * Uses cached getSessionUser for deduplication
 */
export async function requireSuperAdmin() {
  const session = await getSessionUser();
  
  if (!session) {
    return { error: NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }) };
  }

  if (!isSuperAdminRole(session.profile.role)) {
    return { error: NextResponse.json({ success: false, message: "Forbidden: Super Administrative access required" }, { status: 403 }) };
  }

  return { session };
}