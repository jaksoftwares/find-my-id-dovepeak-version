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
    const id_type = searchParams.get("id_type");

    // Get requests without joins
    let dbQuery = supabase
      .from("lost_requests")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      dbQuery = dbQuery.eq("status", status);
    }
    if (id_type && id_type !== "all") {
      dbQuery = dbQuery.eq("id_type", id_type);
    }

    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data: requests, count, error } = await dbQuery;

    if (error) {
      console.error("Error fetching requests:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Get user profiles separately - only for the users in this page
    const userIds = requests?.map(r => r.user_id).filter(Boolean) || [];
    let profiles: Record<string, any> = {};

    if (userIds.length > 0) {
      // Get profiles for the specific user IDs in this page
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);
      
      if (profilesData) {
        profilesData.forEach(p => {
          profiles[p.id] = p;
        });
      }

      // Get emails from auth - but only for these specific users
      try {
        const { data: usersData } = await supabase.auth.admin.listUsers();
        if (usersData?.users) {
          // Filter to only the users we need
          const relevantUserIds = new Set(userIds);
          usersData.users.forEach(u => {
            if (relevantUserIds.has(u.id) && profiles[u.id]) {
              profiles[u.id].email = u.email;
            }
          });
        }
      } catch (emailError) {
        console.error("Error fetching emails:", emailError);
      }
    }

    // Combine data
    const data = requests?.map(req => ({
      ...req,
      profiles: profiles[req.user_id] || null,
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
    console.error("Error in GET /api/admin/requests:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
