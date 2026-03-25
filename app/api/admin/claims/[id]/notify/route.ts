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
    if (!session || (session.profile.role !== 'admin' && session.profile.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: claimId } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get claim and claimant details
    const { data: claim, error: fetchError } = await supabase
      .from("claims")
      .select(`
        claimant,
        profiles!claimant (
          full_name,
          email
        )
      `)
      .eq("id", claimId)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        { success: false, message: `Error fetching claim: ${fetchError.message}` },
        { status: 500 }
      );
    }

    if (!claim || !claim.profiles) {
      return NextResponse.json(
        { success: false, message: "Claim or claimant profile not found. This may be due to database constraints or RLS." },
        { status: 404 }
      );
    }

    const claimant = claim.profiles as any;

    // Get site settings for branding
    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .single();

    const senderName = settings?.sender_name || "JKUAT Customer Service Center";
    const routingEmail = settings?.admin_email_claims || settings?.contact_email;

    // 1. In-app notification
    await createNotification({
      userId: claim.claimant,
      senderId: session.user.id,
      title: "Message from Admin",
      message: message,
      entityType: 'claim',
      entityId: claimId,
      allowReply: true,
      conversationId: claimId, // Using claim ID as conversation group
      link: `/dashboard/claims`
    });

    // 2. Email notification
    if (claimant.email) {
      const template = emailTemplates.customNotification(
        claimant.full_name,
        message
      );
      await sendEmail({
        to: claimant.email,
        subject: template.subject,
        htmlBody: template.html,
        fromName: senderName,
        replyTo: session.user.email || routingEmail
      });
    }

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully",
    });
  } catch (error) {
    console.error("Error in POST /api/admin/claims/[id]/notify:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
