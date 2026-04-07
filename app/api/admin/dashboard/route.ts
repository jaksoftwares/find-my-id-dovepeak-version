import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Admin Dashboard Aggregated Endpoint
 * 
 * Batches all data required for admin dashboard into a single request.
 * Cache Strategy: 
 * - 60s TTL - analytics change moderately
 * - Admin-specific - role-protected
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Single auth resolution - cached per request cycle
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    
    const { session } = auth;
    const supabase = await createClient();

    // Current date calculations for analytics
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const firstDayThisMonthDate = new Date(firstDayThisMonth);
    const firstDayLastMonthDate = new Date(firstDayLastMonth);

    // Execute all queries in parallel for optimal performance
    const [
      // Analytics counts (10 parallel queries)
      totalIdsResult,
      thisMonthIdsResult, 
      lastMonthIdsResult,
      lostRequestsResult,
      thisMonthLostResult,
      lastMonthLostResult,
      totalUsersResult,
      thisMonthUsersResult,
      lastMonthUsersResult,
      recoveredIdsResult,
      
      // Recent data (5 parallel queries)
      recentUsersResult,
      recentIdsResult,
      recentClaimsResult,
      recentRequestsResult
    ] = await Promise.all([
      // --- Analytics Counts ---
      supabase.from("ids_found").select("*", { count: "exact", head: true }),
      supabase.from("ids_found").select("*", { count: "exact", head: true }).gte("created_at", firstDayThisMonth),
      supabase.from("ids_found").select("*", { count: "exact", head: true }).gte("created_at", firstDayLastMonth).lt("created_at", firstDayThisMonth),
      
      supabase.from("lost_requests").select("*", { count: "exact", head: true }),
      supabase.from("lost_requests").select("*", { count: "exact", head: true }).gte("created_at", firstDayThisMonth),
      supabase.from("lost_requests").select("*", { count: "exact", head: true }).gte("created_at", firstDayLastMonth).lt("created_at", firstDayThisMonth),

      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", firstDayThisMonth),
      supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", firstDayLastMonth).lt("created_at", firstDayThisMonth),

      supabase.from("ids_found").select("*", { count: "exact", head: true }).in("status", ["claimed", "returned"]),

      // --- Recent Data (limited) ---
      // Recent users (5 most recent)
      supabase
        .from("profiles")
        .select("id, full_name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      
      // Recent IDs (3 most recent)
      supabase
        .from("ids_found")
        .select("id, full_name, id_type, status, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
      
      // Recent claims (3 most recent with relations)
      supabase
        .from("claims")
        .select(`
          id,
          status,
          created_at,
          ids_found (
            full_name,
            registration_number
          )
        `)
        .order("created_at", { ascending: false })
        .limit(3),
      
      // Recent requests (3 most recent)
      supabase
        .from("lost_requests")
        .select("id, full_name, id_type, status, created_at")
        .order("created_at", { ascending: false })
        .limit(3)
    ]);

    // Log any errors but continue with available data
    if (totalIdsResult.error) console.error("totalIds error:", totalIdsResult.error);
    if (recentUsersResult.error) console.error("recentUsers error:", recentUsersResult.error);
    // ... other errors can be logged similarly

    // Compute analytics from count results
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
    const lastMonthRecoveryRate = 20; // Placeholder for last month calculation

    const analytics = {
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
    };

    // Build recent users array
    const users = (recentUsersResult.data || []).map((u: any) => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      created_at: u.created_at
    }));

    // Build recent activity from IDs, Claims, and Requests
    const activities: Array<{
      id: string;
      type: string;
      description: string;
      created_at: string;
    }> = [];

    // Add ID activities
    (recentIdsResult.data || []).forEach((item: any) => {
      activities.push({
        id: item.id,
        type: 'id_found',
        description: `New ID found: ${item.full_name}`,
        created_at: item.created_at,
      });
    });

    // Add claim activities
    (recentClaimsResult.data || []).forEach((item: any) => {
      activities.push({
        id: item.id,
        type: 'claim',
        description: `Claim ${item.status}: ${item.ids_found?.full_name || 'Unknown'}`,
        created_at: item.created_at,
      });
    });

    // Add request activities
    (recentRequestsResult.data || []).forEach((item: any) => {
      activities.push({
        id: item.id,
        type: 'request',
        description: `Lost request: ${item.full_name}`,
        created_at: item.created_at,
      });
    });

    // Sort by created_at and take top 5
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const recentActivity = activities.slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        analytics,
        users,
        recentActivity
      }
    });

  } catch (error) {
    console.error("Error in GET /api/admin/dashboard:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}