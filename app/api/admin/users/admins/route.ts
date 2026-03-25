import { requireAdmin } from "@/lib/auth";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Specialized endpoint for fetching admin users for select dropdowns 
 * Returns name and email of all 'admin' and 'super_admin' roles
 */
export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    // 1. Fetch profiles with admin roles
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("role", ["admin", "super_admin"])
      .order("full_name");

    if (profileError) {
      return NextResponse.json({ success: false, message: profileError.message }, { status: 500 });
    }

    // 2. Fetch the actual emails from auth.users via admin API
    const { data: usersData, error: usersError } = await adminSupabase.auth.admin.listUsers();
    
    if (usersError) {
      return NextResponse.json({ success: false, message: "Could not fetch user emails" }, { status: 500 });
    }

    // 3. Map emails back to profiles
    const adminList = profiles.map(profile => {
      const authUser = usersData.users.find(u => u.id === profile.id);
      return {
        id: profile.id,
        full_name: profile.full_name,
        role: profile.role,
        email: authUser?.email || ''
      };
    }).filter(a => a.email); // Only include those who have a valid email

    return NextResponse.json({
      success: true,
      data: adminList,
    });

  } catch (error) {
    console.error("Error in GET /api/admin/users/admins:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
