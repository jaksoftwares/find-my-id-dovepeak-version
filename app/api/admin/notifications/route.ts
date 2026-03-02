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

    const type = searchParams.get("type");

    // Get notifications without joins
    let dbQuery = supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (type && type !== "all") {
      dbQuery = dbQuery.eq("type", type);
    }

    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data: notifications, count, error } = await dbQuery;

    if (error) {
      console.error("Error fetching notifications:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Get user profiles separately
    const userIds = notifications?.map(n => n.user_id).filter(Boolean) || [];
    let profiles: Record<string, any> = {};

    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);
      
      if (profilesData) {
        profilesData.forEach(p => {
          profiles[p.id] = p;
        });
      }

      // Get emails from auth
      const { data: usersData } = await supabase.auth.admin.listUsers();
      if (usersData?.users) {
        usersData.users.forEach(u => {
          if (profiles[u.id]) {
            profiles[u.id].email = u.email;
          }
        });
      }
    }

    // Combine data
    const data = notifications?.map(notif => ({
      ...notif,
      profiles: profiles[notif.user_id] || null,
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
    console.error("Error in GET /api/admin/notifications:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { title, message, type, target_user_id } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: "Title and message are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // If target_user_id is provided, send to specific user(s)
    if (target_user_id && target_user_id.trim() !== "") {
      const userIds = target_user_id.split(',').map((id: string) => id.trim()).filter(Boolean);
      
      const inserts = userIds.map((id: string) => ({
        user_id: id,
        title,
        message,
        type: type || 'info',
        is_read: false,
        is_broadcast: false
      }));

      const { error } = await supabase
        .from("notifications")
        .insert(inserts);

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Notification sent to ${userIds.length} user(s) successfully`,
      });
    }

    // Otherwise, broadcast to all users (efficiently - single record)
    const { error } = await supabase
      .from("notifications")
      .insert({
        user_id: null,
        title,
        message,
        type: type || 'info',
        is_read: false,
        is_broadcast: true
      });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Broadcast notification created successfully`,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/notifications:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
