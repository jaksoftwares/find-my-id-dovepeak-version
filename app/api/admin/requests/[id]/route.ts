import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { session } = auth;

    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.status) {
      updateData.status = body.status;
      if (body.status === 'matched') {
        updateData.matched_at = new Date().toISOString();
      }
    }

    if (body.notes !== undefined) {
      updateData.admin_notes = body.notes;
    }

    const { data, error } = await supabase
      .from("lost_requests")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    // Send Status Update Email
    try {
      const formattedIdName = `${data.id_type.replace('_', ' ')}: ${data.registration_number || data.id_number || 'ID'}`;
      const toEmail = data.contact_email;
      
      if (toEmail) {
        const { sendEmail, emailTemplates } = await import("@/lib/email");
        const template = emailTemplates.lostReportUpdate(
          data.full_name,
          formattedIdName,
          data.status,
          body.notes // Optional notes passed in admin update
        );
        
        await sendEmail({
          to: toEmail,
          subject: template.subject,
          htmlBody: template.html,
        });
      }
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Request updated successfully",
      data,
    });
  } catch (error) {
    console.error("Error in PUT /api/admin/requests/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
