import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const { id } = await params;
    const { user } = session;
    const supabase = await createClient();

    // 1. Fetch notification info
    const { data: notification, error: fetchError } = await supabase
      .from("notifications")
      .select("id, is_broadcast, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !notification) {
      return NextResponse.json({ success: false, message: "Notification not found" }, { status: 404 });
    }

    if (notification.is_broadcast) {
      // For broadcasts, insert into notification_reads table
      const { error: readError } = await supabase
        .from("notification_reads")
        .upsert({ user_id: user.id, notification_id: id }, { onConflict: 'user_id,notification_id' });
      
      if (readError) {
        return NextResponse.json({ success: false, message: readError.message }, { status: 500 });
      }
    } else {
      // For personal notifications, verify ownership
      if (notification.user_id !== user.id) {
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
      }

      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (updateError) {
        return NextResponse.json({ success: false, message: updateError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
