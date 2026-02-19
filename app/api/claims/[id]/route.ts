import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updateClaimSchema } from "@/lib/validations/claims";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { session } = auth;
    const { id } = params;
    const body = await request.json();
    const validation = updateClaimSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { status, admin_notes } = validation.data;
    const supabase = await createClient();

    const { data: claim, error: fetchError } = await supabase
      .from("claims")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !claim) {
      return NextResponse.json(
        { success: false, message: "Claim not found" },
        { status: 404 }
      );
    }

    // Begin Transaction (Supabase doesn't support complex explicit transactions via JS client easily, we do sequential updates)
    // If approving, update ID status
    if (status === "approved" && claim.status !== "approved") {
      const { error: idError } = await supabase
        .from("ids_found")
        .update({
          status: "claimed",
          claimed_by: claim.claimant,
        })
        .eq("id", claim.id_found);

      if (idError) {
        return NextResponse.json(
          { success: false, message: "Failed to update item status" },
          { status: 500 }
        );
      }
    }

    const { error: updateError } = await supabase
      .from("claims")
      .update({ status, admin_notes })
      .eq("id", id);

    if (updateError) {
      // If we updated item status but failed to update claim, data inconsistency.
      // Ideally use RPC for atomic updates.
      return NextResponse.json(
        { success: false, message: updateError.message },
        { status: 500 }
      );
    }

    // Audit Log
    await supabase.from("audit_logs").insert({
      actor: session.user.id,
      action: `claim_${status}`,
      entity_type: "claims",
      entity_id: id,
      details: { status, item_id: claim.id_found },
    });

    return NextResponse.json({ success: true, message: `Claim ${status}` });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
