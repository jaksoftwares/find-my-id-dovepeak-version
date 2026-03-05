import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    
    const supabase = await createClient();

    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

    const [
      totalIdsResult,
      thisMonthIdsResult, 
      lastMonthIdsResult,
      lostRequestsResult,
      thisMonthLostResult,
      lastMonthLostResult,
      totalUsersResult,
      thisMonthUsersResult,
      lastMonthUsersResult,
      recoveredIdsResult
    ] = await Promise.all([
      // IDs Found
      supabase.from("ids_found").select("*", { count: "exact", head: true }),
      supabase.from("ids_found").select("*", { count: "exact", head: true }).gte("created_at", firstDayThisMonth),
      supabase.from("ids_found").select("*", { count: "exact", head: true }).gte("created_at", firstDayLastMonth).lt("created_at", firstDayThisMonth),
      
      // Lost Requests
      supabase.from("lost_requests").select("*", { count: "exact", head: true }),
      supabase.from("lost_requests").select("*", { count: "exact", head: true }).gte("created_at", firstDayThisMonth),
      supabase.from("lost_requests").select("*", { count: "exact", head: true }).gte("created_at", firstDayLastMonth).lt("created_at", firstDayThisMonth),

      // Users
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", firstDayThisMonth),
      supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", firstDayLastMonth).lt("created_at", firstDayThisMonth),

      // Recovered IDs
      supabase.from("ids_found").select("*", { count: "exact", head: true }).in("status", ["claimed", "returned"]),
    ]);

    const totalIds = totalIdsResult.count || 0;
    const thisMonthIds = thisMonthIdsResult.count || 0;
    const lastMonthIds = lastMonthIdsResult.count || 0;

    const totalLost = lostRequestsResult.count || 0;
    const thisMonthLost = thisMonthLostResult.count || 0;
    const lastMonthLost = lastMonthLostResult.count || 0;

    const totalUsers = totalUsersResult.count || 0;
    const thisMonthUsers = thisMonthUsersResult.count || 0;
    const lastMonthUsers = lastMonthUsersResult.count || 0;

    const recoveredIds = recoveredIdsResult.count || 0;
    const recoveryRate = totalIds ? (recoveredIds / totalIds) * 100 : 0;
    const lastMonthRecoveryRate = 20; // Placeholder

    return NextResponse.json({
      success: true,
      data: {
        totalIds,
        thisMonthIds,
        lastMonthIds,
        totalLost,
        thisMonthLost,
        lastMonthLost,
        totalUsers,
        thisMonthUsers,
        lastMonthUsers,
        recoveryRate: parseFloat(recoveryRate.toFixed(2)),
        lastMonthRecoveryRate,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/admin/analytics:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
