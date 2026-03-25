import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ conversation_id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { conversation_id } = await params;
    const supabase = await createClient();

    // Fetch all messages in this conversation
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        *,
        sender:profiles!sender_id(full_name, avatar_url, role),
        recipient:profiles!user_id(full_name, avatar_url, role)
      `)
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true });

    if (error) {
       console.error("Error fetching conversation:", error);
       return NextResponse.json(
         { success: false, message: "Could not fetch conversation" },
         { status: 500 }
       );
    }

    // Check permissions: User must be either a recipient or sender of ANY message in this conversation
    // or be an admin
    const canAccess = session.profile.role === 'admin' || session.profile.role === 'super_admin' || 
                      data.some(m => m.user_id === session.user.id || m.sender_id === session.user.id);

    if (!canAccess && data.length > 0) {
       return NextResponse.json(
        { success: false, message: "Permission denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    console.error("Error in GET /api/notifications/conversation/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
