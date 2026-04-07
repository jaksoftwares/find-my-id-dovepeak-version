import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * User Dashboard Aggregated Endpoint
 * 
 * Batches all data required for user dashboard into a single request.
 * Cache Strategy: 
 * - 60s TTL - moderate change data (dashboard stats)
 * - User-specific - personalized per user
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Single auth resolution - cached per request cycle
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { user } = session;
    const supabase = await createClient();

    // Execute all queries in parallel for optimal performance
    // Each query is independent, so parallel execution is safe
    const [
      requestsResult,
      claimsResult,
      idsResult
    ] = await Promise.all([
      // Fetch user's lost requests
      supabase
        .from("lost_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      
      // Fetch user's claims
      supabase
        .from("claims")
        .select(`
          *,
          ids_found (
            full_name,
            registration_number,
            id_type,
            image_url
          )
        `)
        .eq("claimant", user.id)
        .order("created_at", { ascending: false }),
      
      // Fetch verified IDs (public data - no user filter needed)
      supabase
        .from("ids_found")
        .select("id, full_name, id_type, registration_number, status, created_at")
        .eq("status", "verified")
        .eq("visibility", true)
        .order("created_at", { ascending: false })
        .limit(100)
    ]);

    // Handle any errors but continue with available data
    if (requestsResult.error) {
      console.error("Requests fetch error:", requestsResult.error);
    }
    if (claimsResult.error) {
      console.error("Claims fetch error:", claimsResult.error);
    }
    if (idsResult.error) {
      console.error("IDs fetch error:", idsResult.error);
    }

    // Compute stats from the fetched data
    const requests = requestsResult.data || [];
    const claims = claimsResult.data || [];
    const ids = idsResult.data || [];

    const stats = {
      activeReports: requests.filter((r: any) => r.status === "submitted").length,
      pendingClaims: claims.filter((c: any) => c.status === "pending").length,
      foundItems: ids.length,
      myClaims: claims.length,
    };

    return NextResponse.json({
      success: true,
      data: {
        requests: requests,
        claims: claims,
        ids: ids,
        stats: stats
      }
    });

  } catch (error) {
    console.error("Error in GET /api/dashboard:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}