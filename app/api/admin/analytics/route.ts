import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    
    const supabase = await createClient();

    // 1. Total IDs found
    const { count: totalIds } = await supabase
      .from("ids_found")
      .select("*", { count: "exact", head: true });

    // 2. Verified IDs
    const { count: verifiedIds } = await supabase
      .from("ids_found")
      .select("*", { count: "exact", head: true })
      .eq("status", "verified");

    // 3. Claimed/Returned IDs (Recovered)
    const { count: recoveredIds } = await supabase
      .from("ids_found")
      .select("*", { count: "exact", head: true })
      .in("status", ["claimed", "returned"]);

    // 4. Lost Requests
    const { count: lostRequests } = await supabase
      .from("lost_requests")
      .select("*", { count: "exact", head: true });

    // 5. Monthly stats
    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();

    const { count: thisMonthFound } = await supabase
        .from("ids_found")
        .select("*", { count: "exact", head: true })
        .gte("created_at", currentMonthStart);

    const recoveryRate = totalIds ? ((recoveredIds || 0) / totalIds) * 100 : 0;

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
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
