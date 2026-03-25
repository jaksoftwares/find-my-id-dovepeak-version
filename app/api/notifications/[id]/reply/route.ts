import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(
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

    const { id: notificationId } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get original notification to check allow_reply and get thread info
    const { data: original, error: fetchError } = await supabase
      .from("notifications")
      .select("*, sender:profiles!sender_id(*)")
      .eq("id", notificationId)
      .single();

    if (fetchError || !original) {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      );
    }

    // Authorization: User must be either the recipient or sender of the original message
    if (original.user_id !== session.user.id && original.sender_id !== session.user.id) {
       return NextResponse.json(
        { success: false, message: "You don't have permission to reply to this message" },
        { status: 403 }
      );
    }

    if (!original.allow_reply) {
      return NextResponse.json(
        { success: false, message: "Replies not allowed for this message" },
        { status: 400 }
      );
    }

    // Recipient of the reply is whoever sent the original message (or the recipient if we are the sender)
    const recipientId = original.user_id === session.user.id ? original.sender_id : original.user_id;
    
    if (!recipientId) {
      return NextResponse.json(
        { success: false, message: "Recipient not found" },
        { status: 400 }
      );
    }

    // 1. Save message to DB
    const result = await createNotification({
      userId: recipientId,
      senderId: session.user.id,
      title: `Reply regarding your message`,
      message: message,
      type: 'reply',
      parentId: original.id,
      entityType: original.entity_type,
      entityId: original.entity_id,
      allowReply: true,
      conversationId: original.conversation_id || original.id, // Fallback to original ID if no conversation ID
    });

    if (!result.success) {
      throw new Error("Failed to create notification");
    }

    // 2. Email notification
    const recipient = original.sender as any;
    if (recipient && recipient.email) {
      const template = emailTemplates.customNotification(
        recipient.full_name,
        `You have a new reply regarding a claim: "${message}"`
      );
      await sendEmail({
        to: recipient.email,
        subject: `New Reply: ${session.profile.full_name}`,
        htmlBody: template.html
      });
    }

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully",
      data: result.data
    });
  } catch (error: any) {
    console.error("Error in POST /api/notifications/[id]/reply:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
