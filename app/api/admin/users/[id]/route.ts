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

    const { id } = await params;
    const body = await request.json();
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabaseAdmin = await createAdminClient();

    // Fetch the target user's current role to check permissions
    const { data: targetProfile, error: targetError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", id)
      .single();

    if (!targetError && targetProfile) {
      const requesterRole = auth.session.profile.role;
      const targetRole = targetProfile.role;

      // Only super_admin can edit administrative accounts
      if ((targetRole === 'admin' || targetRole === 'super_admin') && requesterRole !== 'super_admin') {
        return NextResponse.json(
          { success: false, message: "Forbidden: Only super admins can modify administrative accounts" },
          { status: 403 }
        );
      }
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.full_name !== undefined) updateData.full_name = body.full_name;
    if (body.role !== undefined) {
      // Security: Only super_admin can grant admin or super_admin roles
      const requesterRole = auth.session.profile.role;
      if ((body.role === 'admin' || body.role === 'super_admin') && requesterRole !== 'super_admin') {
        return NextResponse.json(
          { success: false, message: "Forbidden: Only super admins can grant administrative roles" },
          { status: 403 }
        );
      }
      updateData.role = body.role;
    }
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.registration_number !== undefined) updateData.registration_number = body.registration_number;
    if (body.faculty !== undefined) updateData.faculty = body.faculty;

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Error updating profile:", error);
      return NextResponse.json(
        { success: false, message: error?.message || "Failed to update profile or user not found" },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await params;
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const supabaseAdmin = await createAdminClient();

    // Fetch the persona to check their role before deletion
    const { data: profileToDelete, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", id)
      .single();

    if (!fetchError && profileToDelete) {
      const requesterRole = auth.session.profile.role;
      const targetRole = profileToDelete.role;

      // Only super_admin can delete admins or other super_admins
      if ((targetRole === 'admin' || targetRole === 'super_admin') && requesterRole !== 'super_admin') {
        return NextResponse.json(
          { success: false, message: "Forbidden: Only super admins can delete administrative accounts" },
          { status: 403 }
        );
      }
    }

    // Delete from auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

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
