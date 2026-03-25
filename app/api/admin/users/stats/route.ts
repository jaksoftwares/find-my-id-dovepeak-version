import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const supabase = await createClient();

    // Fetch total counts using a single query if possible or separate ones
    // Profiles table is smaller than auth users
    const [
      { count: totalCount },
      { count: studentCount },
      { count: staffCount },
      { count: adminCount }
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "staff"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total: totalCount || 0,
        students: studentCount || 0,
        staff: staffCount || 0,
        admins: adminCount || 0,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/admin/users/stats:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
