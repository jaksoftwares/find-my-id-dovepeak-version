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
