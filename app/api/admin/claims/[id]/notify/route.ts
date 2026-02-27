import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.profile.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: claimId } = params;
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
    const { data: claim } = await supabase
      .from("claims")
      .select(`
        claimant,
        profiles!claimant (
          full_name,
          email
        )
      `)
      .eq("id", claimId)
      .single();

    if (!claim || !claim.profiles) {
      return NextResponse.json(
        { success: false, message: "Claim or claimant not found" },
        { status: 404 }
      );
    }

    const claimant = claim.profiles as any;

    // 1. In-app notification
    await createNotification({
      userId: claim.claimant,
      title: "Message from Admin",
      message: message,
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
        htmlBody: template.html
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
