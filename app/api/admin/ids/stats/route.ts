import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    
    const supabase = await createClient();

    const [
      totalCount,
      pendingCount,
      verifiedCount,
      claimedCount,
      returnedCount,
      archivedCount
    ] = await Promise.all([
      supabase.from("ids_found").select("*", { count: "exact", head: true }),
      supabase.from("ids_found").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("ids_found").select("*", { count: "exact", head: true }).eq("status", "verified"),
      supabase.from("ids_found").select("*", { count: "exact", head: true }).eq("status", "claimed"),
      supabase.from("ids_found").select("*", { count: "exact", head: true }).eq("status", "returned"),
      supabase.from("ids_found").select("*", { count: "exact", head: true }).eq("status", "archived"),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total: totalCount.count || 0,
        pending: pendingCount.count || 0,
        verified: verifiedCount.count || 0,
        claimed: claimedCount.count || 0,
        returned: returnedCount.count || 0,
        archived: archivedCount.count || 0
      }
    });
  } catch (error) {
    console.error("Error in GET /api/admin/ids/stats:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
