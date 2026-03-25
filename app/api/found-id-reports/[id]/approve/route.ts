import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await params;
    const { holding_location, notes } = await request.json();

    const supabase = await createClient();

    // 1. Get the submission details
    const { data: submission, error: fetchError } = await supabase
      .from("public_found_reports")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json(
        { success: false, message: "Submission not found" },
        { status: 404 }
      );
    }

    if (submission.status === 'approved') {
      return NextResponse.json(
        { success: false, message: "Submission already approved" },
        { status: 400 }
      );
    }

    // 2. Insert into ids_found
    const { data: foundId, error: insertError } = await supabase
      .from("ids_found")
      .insert({
        id_type: submission.id_type,
        full_name: submission.full_name,
        registration_number: submission.registration_number,
        location_found: submission.location_found || 'Unknown',
        description: submission.description,
        image_url: submission.image_url,
        status: 'verified',
        submitted_by: submission.finder_id,
        approved_by: auth.session.user.id,
        holding_location: holding_location || 'Main Office',
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, message: "Failed to create ID entry: " + insertError.message },
        { status: 500 }
      );
    }

    // 3. Update submission status
    const { error: updateError } = await supabase
      .from("public_found_reports")
      .update({
        approved: true,
        status: 'approved',
        reviewed_by: auth.session.user.id
      })
      .eq("id", id);

    if (updateError) {
      // Logic would ideally rollback but for simple app we'll just report
      return NextResponse.json(
        { success: false, message: "ID created but submission status update failed" },
        { status: 500 }
      );
    }

    // 4. Create notification for the finder if they were logged in
    if (submission.finder_id) {
      await supabase.from("notifications").insert({
        user_id: submission.finder_id,
        title: "ID Submission Approved",
        message: `Your report for ${submission.full_name}'s ID has been verified and listed! Thank you for your honesty.`,
      });
    }

    // 5. Send email notification to finder if email exists
    try {
       const contactInfo = submission.contact_info;
       if (contactInfo && contactInfo.includes("@")) {
          const { sendEmail, emailTemplates } = await import("@/lib/email");
          const { data: settings } = await supabase.from("settings").select("*").single();
          
          const senderName = settings?.sender_name || "JKUAT Customer Service Center";
          const routingEmail = settings?.admin_email_found_ids || settings?.contact_email;
          
          const idName = `${submission.id_type.replace('_', ' ')}: ${submission.full_name}`;
          const template = emailTemplates.foundReportSubmittedUser(submission.name || "Finder", idName);
          
          // Overwrite body with approval specific text
          const approvalTemplate = emailTemplates.customNotification(
            submission.name || "Finder",
            `Good news! Your submission for <strong>${idName}</strong> has been <strong>approved and verified</strong> by our administration.<br/><br/>
            It is now listed on FindMyID for the owner to find. Thank you for your honesty and for making JKUAT a safer community!`
          );

          await sendEmail({
             to: contactInfo,
             subject: "ID Submission Approved - JKUAT FindMyID",
             htmlBody: approvalTemplate.html,
             fromName: senderName,
             replyTo: auth.session.user.email || routingEmail
          });
       }
    } catch (emailErr) {
       console.error("Email notification error in found ID approval:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Submission approved and listed",
      data: foundId
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
