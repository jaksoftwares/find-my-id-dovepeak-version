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
    const supabase = await createClient();

    // 1. Mark personal notifications as read
    const { error: personalError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (personalError) {
      return NextResponse.json({ success: false, message: personalError.message }, { status: 500 });
    }

    // 2. Mark broadcast notifications as read
    // For broadcasts, we need to find which ones the user HASN'T read yet
    // and insert records into notification_reads.
    
    // (A) Get IDs of all broadcasts
    const { data: broadcasts } = await supabase
      .from("notifications")
      .select("id")
      .eq("is_broadcast", true);
    
    if (broadcasts && broadcasts.length > 0) {
      const broadcastIds = broadcasts.map(b => b.id);
      
      // (B) Get IDs of broadcasts already read
      const { data: alreadyRead } = await supabase
        .from("notification_reads")
        .select("notification_id")
        .eq("user_id", user.id)
        .in("notification_id", broadcastIds);
      
      const readSet = new Set(alreadyRead?.map(r => r.notification_id) || []);
      const toInsert = broadcastIds.filter(id => !readSet.has(id));

      if (toInsert.length > 0) {
        const { error: broadcastError } = await supabase
          .from("notification_reads")
          .insert(toInsert.map(id => ({ user_id: user.id, notification_id: id })));
        
        if (broadcastError) {
           return NextResponse.json({ success: false, message: broadcastError.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
