import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = params;
    const body = await request.json();
    const supabase = await createClient();

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.full_name) updateData.full_name = body.full_name;
    if (body.role) updateData.role = body.role;
    if (body.phone !== undefined) updateData.phone = body.phone;

    const { data, error } = await supabase
      .from("profiles")
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
      message: "User updated successfully",
      data,
    });
  } catch (error) {
    console.error("Error in PUT /api/admin/users/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = params;
    const supabase = await createClient();

    // Delete from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) {
      return NextResponse.json(
        { success: false, message: authError.message },
        { status: 500 }
      );
    }

    // Delete profile (if exists)
    await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /api/admin/users/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
