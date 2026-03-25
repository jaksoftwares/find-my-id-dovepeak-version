import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const supabase = await createClient();

    const [
      { count: totalCount },
      { count: pendingCount },
      { count: approvedCount },
      { count: completedCount },
      { count: rejectedCount }
    ] = await Promise.all([
      supabase.from("claims").select("*", { count: "exact", head: true }),
      supabase.from("claims").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("claims").select("*", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("claims").select("*", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("claims").select("*", { count: "exact", head: true }).eq("status", "rejected"),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total: totalCount || 0,
        pending: pendingCount || 0,
        approved: approvedCount || 0,
        completed: completedCount || 0,
        rejected: rejectedCount || 0,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/admin/claims/stats:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
