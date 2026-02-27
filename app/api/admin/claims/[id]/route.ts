import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
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

    const { id } = params;
    const body = await request.json();
    const supabase = await createClient();

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
      processed_by: session.profile.id,
      processed_at: new Date().toISOString(),
    };

    if (body.status) {
      updateData.status = body.status;
      
      // If claim is approved, update the ID status to claimed
      if (body.status === 'approved') {
        // Get the claim to find the id_found
        const { data: claim } = await supabase
          .from("claims")
          .select("id_found")
          .eq("id", id)
          .single();

        if (claim) {
          await supabase
            .from("ids_found")
            .update({ status: 'claimed' })
            .eq("id", claim.id_found);
        }
      }
      
      // If claim is completed, update the ID status to returned
      if (body.status === 'completed') {
        // Get the claim to find the id_found
        const { data: claim } = await supabase
          .from("claims")
          .select("id_found")
          .eq("id", id)
          .single();

        if (claim) {
          await supabase
            .from("ids_found")
            .update({ status: 'returned' })
            .eq("id", claim.id_found);
        }
      }
    }

    if (body.admin_notes !== undefined) {
      updateData.admin_notes = body.admin_notes;
    }

    const { data, error } = await supabase
      .from("claims")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Trigger notification for the user
    if (body.status || body.admin_notes) {
      triggerUserClaimNotification(id, body.status, body.admin_notes);
    }

    return NextResponse.json({
      success: true,
      message: "Claim updated successfully",
      data,
    });
  } catch (error) {
    console.error("Error in PUT /api/admin/claims/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

async function triggerUserClaimNotification(claimId: string, status?: string, notes?: string) {
  try {
    const supabase = await createClient();
    
    // Get claim, item, and claimant details
    const { data: claim } = await supabase
      .from("claims")
      .select(`
        claimant,
        id_found (
          full_name
        ),
        profiles!claimant (
          full_name,
          email
        )
      `)
      .eq("id", claimId)
      .single();

    if (!claim || !claim.profiles) return;

    const claimant = claim.profiles as any;
    const item = claim.id_found as any;
    const itemName = item?.full_name || "your ID";

    // 1. In-app notification
    const { createNotification } = await import("@/lib/notifications");
    await createNotification({
      userId: claim.claimant,
      title: "Claim Update",
      message: `Your claim for ${itemName} has been updated to: ${status || 'Processed'}.`,
    });

    // 2. Email notification
    if (claimant.email) {
      const { sendEmail, emailTemplates } = await import("@/lib/email");
      const template = emailTemplates.claimStatusUpdate(
        claimant.full_name,
        itemName,
        status || "updated",
        notes
      );
      await sendEmail({
        to: claimant.email,
        subject: template.subject,
        htmlBody: template.html
      });
    }
  } catch (err) {
    console.error("Error in triggerUserClaimNotification:", err);
  }
}
