import { requireAdmin } from "@/lib/auth";
import { createClient, createAdminClient } from "@/lib/supabase/server";
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

    // Handle Auth Updates (Email/Password/Metadata)
    if (body.email || body.password || body.full_name) {
      const authUpdates: Record<string, any> = {};
      if (body.email) {
        authUpdates.email = body.email;
        authUpdates.email_confirm = true;
      }
      if (body.password) authUpdates.password = body.password;
      if (body.full_name) authUpdates.user_metadata = { full_name: body.full_name };

      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        authUpdates
      );

      if (authError) {
        console.error("Error updating auth user:", authError);
        return NextResponse.json(
          { success: false, message: `Auth error: ${authError.message}` },
          { status: 500 }
        );
      }
    }

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (profileError || !profileData) {
      console.error("Error updating profile:", profileError);
      return NextResponse.json(
        { success: false, message: profileError?.message || "Failed to update profile or user not found" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: profileData,
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
  const { id } = await params;
  
  try {
    // 1. Initial Authentication Check
    const auth = await requireAdmin();
    if (auth.error) {
      console.error("Authentication failed for DELETE request:", auth.error);
      return auth.error;
    }

    const { session } = auth;
    const requesterId = session.user.id;
    const requesterRole = session.profile.role;

    // 2. Prevent self-deletion
    if (requesterId === id) {
      return NextResponse.json(
        { success: false, message: "Security error: You cannot delete your own account" },
        { status: 400 }
      );
    }

    // 3. Super Admin requirement check for administrative targets
    const supabaseAdmin = await createAdminClient();

    // Fetch the target user's profile using admin client to ensure we get it
    const { data: targetProfile, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", id)
      .single();

    if (fetchError || !targetProfile) {
      return NextResponse.json(
        { success: false, message: "User not found or profile missing" },
        { status: 404 }
      );
    }

    // Security: Only super_admin can delete other admins or super_admins
    const isTargetAdmin = targetProfile.role === 'admin' || targetProfile.role === 'super_admin';
    if (isTargetAdmin && requesterRole !== 'super_admin') {
      return NextResponse.json(
        { success: false, message: "Forbidden: Only super administrators can remove other administrative accounts" },
        { status: 403 }
      );
    }

    // 4. DEFENSIVE CLEANUP: Manually delete related data to prevent FK constraint errors
    // Use Promise.allSettled to try to clear as much as possible even if some tables don't exist
    await Promise.allSettled([
      supabaseAdmin.from("claims").delete().eq("claimant", id),
      supabaseAdmin.from("lost_requests").delete().eq("user_id", id),
      supabaseAdmin.from("public_found_reports").delete().eq("finder_id", id),
      supabaseAdmin.from("notifications").delete().eq("user_id", id),
      supabaseAdmin.from("notification_reads").delete().eq("user_id", id),
      supabaseAdmin.from("forum_likes").delete().eq("user_id", id),
      supabaseAdmin.from("forum_comments").delete().eq("author_id", id),
      supabaseAdmin.from("forum_posts").delete().eq("author_id", id),
    ]);

    // 5. Perform the deletion (Auth then Profile)
    // We try to delete the Auth record which is the source of truth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      console.error("Supabase Auth deletion error:", authError);
      
      // If auth deletion failed with DB error, it's almost certainly a missed FK constraint
      const isFKError = authError.message.toLowerCase().includes("database error") || 
                        authError.message.toLowerCase().includes("violate");
      
      return NextResponse.json(
        { 
          success: false, 
          message: isFKError 
            ? `Database Integrity Error: This user has active records in other tables (e.g. forum, requests) that cannot be automatically removed. Please contact technical support to fix the database constraints.`
            : `Auth error: ${authError.message}` 
        },
        { status: 500 }
      );
    }

    // Deleting the profile record
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", id);

    if (profileError) {
       console.error("Supabase Profile deletion error:", profileError);
       // We don't fail the whole request here as the auth account is already gone
    }

    return NextResponse.json({
      success: true,
      message: `Account for ${targetProfile.full_name} has been permanently removed and related records cleaned up`,
    });
  } catch (error: any) {
    console.error("Unexpected error in user deletion:", error);
    return NextResponse.json(
      { success: false, message: error.message || "A server-side error occurred during account removal" },
      { status: 500 }
    );
  }
}
