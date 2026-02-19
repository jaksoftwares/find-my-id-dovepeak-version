import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";
import { NextResponse } from "next/server";

export type UserProfile = Database['public']['Tables']['profiles']['Row'];

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Fetch profile to get role
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
}

export async function requireAuth() {
  const session = await getSessionUser();
  if (!session) {
    return { error: NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }) };
  }
  return { session };
}

export async function requireAdmin() {
  const session = await getSessionUser();
  
  if (!session) {
    return { error: NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }) };
  }

  if (session.profile.role !== "admin") {
    return { error: NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 }) };
  }

  return { session };
}
