import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const supabase = await createClient();

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const status = searchParams.get("status");

    // Get claims without joins first
    let dbQuery = supabase
      .from("claims")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      dbQuery = dbQuery.eq("status", status);
    }

    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data: claims, count, error } = await dbQuery;

    if (error) {
      console.error("Error fetching claims:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Get IDs and profiles separately - only for this page
    const idsFoundIds = claims?.map(c => c.id_found).filter(Boolean) || [];
    const claimantIds = claims?.map(c => c.claimant).filter(Boolean) || [];

    let idsFound: Record<string, any> = {};
    let profiles: Record<string, any> = {};

    if (idsFoundIds.length > 0) {
      const { data: idsData } = await supabase
        .from("ids_found")
        .select("id, full_name, registration_number, id_type, image_url")
        .in("id", idsFoundIds);
      
      if (idsData) {
        idsData.forEach(i => {
          idsFound[i.id] = i;
        });
      }
    }

    if (claimantIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", claimantIds);
      
      if (profilesData) {
        profilesData.forEach(p => {
          profiles[p.id] = p;
        });
      }

      // Also get emails from auth - but only for the claimants in this page
      try {
        const { data: usersData } = await supabase.auth.admin.listUsers();
        if (usersData?.users) {
          // Filter to only the users we need
          const relevantClaimantIds = new Set(claimantIds);
          usersData.users.forEach(u => {
            if (relevantClaimantIds.has(u.id) && profiles[u.id]) {
              profiles[u.id].email = u.email;
            }
          });
        }
      } catch (emailError) {
        console.error("Error fetching emails:", emailError);
      }
    }

    // Combine data
    const data = claims?.map(claim => ({
      ...claim,
      ids_found: idsFound[claim.id_found] || null,
      profiles: profiles[claim.claimant] || null,
    })) || [];

    return NextResponse.json({
      success: true,
      data,
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/admin/claims:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
