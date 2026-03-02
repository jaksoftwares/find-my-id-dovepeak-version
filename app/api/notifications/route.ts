import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const { user } = session;
    const supabase = await createClient();
    
    // Fetch personal and broadcast notifications
    const { data: notifications, error: notifError } = await supabase
      .from("notifications")
      .select("*")
      .or(`user_id.eq.${user.id},is_broadcast.eq.true`)
      .order("created_at", { ascending: false })
      .limit(50);

    if (notifError) {
       return NextResponse.json(
         { success: false, message: notifError.message },
         { status: 500 }
       );
    }

    // Fetch reads for individual status (only needed for broadcasts)
    const broadcastIds = (notifications || [])
      .filter((n: any) => n.is_broadcast)
      .map((n: any) => n.id);

    let readBroadcastIds: Set<string> = new Set();
    if (broadcastIds.length > 0) {
      const { data: reads } = await supabase
        .from("notification_reads")
        .select("notification_id")
        .eq("user_id", user.id)
        .in("notification_id", broadcastIds);
      
      if (reads) {
        reads.forEach((r: any) => readBroadcastIds.add(r.notification_id));
      }
    }

    // Final mapping
    const data = (notifications || []).map((n: any) => ({
      ...n,
      is_read: n.is_broadcast ? readBroadcastIds.has(n.id) : n.is_read
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
