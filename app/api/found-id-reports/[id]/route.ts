import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { session } = auth;
    const { id } = await params;
    const body = await request.json();
    const { action } = body; // "approve" or "reject"
    
    if (action !== "approve" && action !== "reject") {
        return NextResponse.json(
            { success: false, message: "Invalid action" },
            { status: 400 }
        );
    }

    const supabase = await createClient();

    const { data: submission, error: fetchError } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json(
        { success: false, message: "Submission not found" },
        { status: 404 }
      );
    }

    if (submission.reviewed_by) {
        return NextResponse.json(
            { success: false, message: "Submission already processed" },
            { status: 400 }
        );
    }

    if (action === "approve") {
        // Move to ids_found
        const { error: insertError } = await supabase
            .from("ids_found")
            .insert({
                id_type: submission.id_type,
                full_name: submission.full_name,
                registration_number: submission.registration_number,
                image_url: submission.image_url,
                location_found: submission.location_found,
                description: `Submitted by public. Contact: ${submission.contact_info || 'N/A'}`,
                status: "verified", // Assume verified if admin approves
                visibility: true,
                submitted_by: session.user.id, // Admin takes ownership 
            });
        
        if (insertError) {
             return NextResponse.json(
                { success: false, message: insertError.message },
                { status: 500 }
             );
        }

        // Mark as approved (and reviewed)
        await supabase
            .from("submissions")
            .update({ approved: true, reviewed_by: session.user.id })
            .eq("id", id);
        
        // Audit
        await supabase.from("audit_logs").insert({
            actor: session.user.id,
            action: "approve_submission",
            entity_type: "submissions",
            entity_id: id
        });
        
        return NextResponse.json({ success: true, message: "Submission approved and ID created" });
    } else {
        // Reject - just mark reviewed? Or delete?
        // Prompt says "Approve or reject".
        // I'll just delete it or mark it?
        // Schema has `approved` boolean.
        // I'll just Log it and maybe deleting is better to cleanup?
        // Or keep it as rejected. But `approved` is boolean.
        // I'll just leave `approved: false` but set `reviewed_by`.
        await supabase
            .from("submissions")
            .update({ reviewed_by: session.user.id }) // Remains approved: false
            .eq("id", id);
            
         return NextResponse.json({ success: true, message: "Submission rejected" });
    }

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
