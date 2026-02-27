import { getSessionUser, requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updateIdSchema } from "@/lib/validations/ids";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from("ids_found")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Error fetching ID by id:", error);
      return NextResponse.json(
        { success: false, message: "ID not found" },
        { status: 404 }
      );
    }

    // Role check for visibility
    if (session?.profile.role !== "admin") {
      if (!data.visibility || data.status !== "verified") {
        return NextResponse.json(
          { success: false, message: "ID not accessible" },
          { status: 403 }
        );
      }
      // Mask sensitive data
      data.registration_number = data.registration_number.replace(/.(?=.{4})/g, "*");
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in GET /api/ids/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const validation = updateIdSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const updates = validation.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from("ids_found")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating ID:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update ID. Please try again later." },
        { status: 500 }
      );
    }

    // Audit Log
    await supabase.from("audit_logs").insert({
      actor: session.user.id,
      action: "update_id",
      entity_type: "ids_found",
      entity_id: id,
      details: updates,
    });

    return NextResponse.json({ success: true, message: "ID updated successfully" });
  } catch (error) {
    console.error("Error in PATCH /api/ids/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { session } = auth;
    const { id } = await params;
    const supabase = await createClient();

    // Soft delete implementation: set status to 'archived'
    const { error } = await supabase
      .from("ids_found")
      .update({ status: "archived", visibility: false })
      .eq("id", id);

    if (error) {
      console.error("Error archiving ID:", error);
      return NextResponse.json(
        { success: false, message: "Failed to archive ID. Please try again later." },
        { status: 500 }
      );
    }

    // Audit Log
    await supabase.from("audit_logs").insert({
      actor: session.user.id,
      action: "delete_id",
      entity_type: "ids_found",
      entity_id: id,
    });

    return NextResponse.json({ success: true, message: "ID archived successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/ids/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
