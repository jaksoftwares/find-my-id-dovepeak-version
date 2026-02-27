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
