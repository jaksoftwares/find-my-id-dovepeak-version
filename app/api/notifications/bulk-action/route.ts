import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const { user } = session;
    const body = await request.json();
    const { action, ids } = body;

    const supabase = await createClient();

    if (action === 'delete') {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ success: false, message: "No notification IDs provided" }, { status: 400 });
      }

      // We only allow users to delete their own personal notifications.
      // Broadcast notifications usually cannot be "deleted" by users from the main table,
      // but they can be "dismissed" (we'd need a separate dismissal table).
      // For now, let's assume we are deleting from the 'notifications' table where possible.
      
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id)
        .in("id", ids);

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: `${ids.length} notification(s) deleted` });
    }

    if (action === 'clear-all') {
        const { error } = await supabase
          .from("notifications")
          .delete()
          .eq("user_id", user.id);
        
        if (error) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "All notifications cleared" });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
