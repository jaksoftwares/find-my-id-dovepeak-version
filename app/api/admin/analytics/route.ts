import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    
    const supabase = await createClient();

    // Run all queries in parallel for better performance
    const [
      totalIdsResult,
      verifiedIdsResult,
      recoveredIdsResult,
      lostRequestsResult,
      thisMonthFoundResult
    ] = await Promise.all([
      // 1. Total IDs found
      supabase
        .from("ids_found")
        .select("*", { count: "exact", head: true }),
      
      // 2. Verified IDs
      supabase
        .from("ids_found")
        .select("*", { count: "exact", head: true })
        .eq("status", "verified"),
      
      // 3. Claimed/Returned IDs (Recovered)
      supabase
        .from("ids_found")
        .select("*", { count: "exact", head: true })
        .in("status", ["claimed", "returned"]),
      
      // 4. Lost Requests
      supabase
        .from("lost_requests")
        .select("*", { count: "exact", head: true }),
      
      // 5. Monthly stats - IDs found this month
      Promise.resolve(
        (async () => {
          const currentDate = new Date();
          const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
          
          return supabase
            .from("ids_found")
            .select("*", { count: "exact", head: true })
            .gte("created_at", currentMonthStart);
        })()
      )
    ]);

    const totalIds = totalIdsResult.count || 0;
    const verifiedIds = verifiedIdsResult.count || 0;
    const recoveredIds = recoveredIdsResult.count || 0;
    const lostRequests = lostRequestsResult.count || 0;
    const thisMonthFound = thisMonthFoundResult.count || 0;

    const recoveryRate = totalIds ? ((recoveredIds) / totalIds) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalIds,
        verifiedIds,
        recoveredIds,
        lostRequests,
        recoveryRate: parseFloat(recoveryRate.toFixed(2)),
        thisMonthFound
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
