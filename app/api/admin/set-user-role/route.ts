import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schema for updating user role
const updateRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["student", "staff", "admin", "super_admin"]),
});

export async function POST(request: Request) {
  try {
    const { requireAdmin } = await import("@/lib/auth");
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const supabase = await createClient();

    const body = await request.json();
    const result = updateRoleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: result.error.issues },
        { status: 400 }
      );
    }

    const { userId, role } = result.data;

    // Additional check: Only super_admin can set a role to admin or super_admin
    // and only super_admin can change anyone's role TO super_admin
    const isSuperAdmin = auth.session.profile.role === "super_admin";
    
    if ((role === "admin" || role === "super_admin") && !isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Only super admins can grant administrative roles" },
        { status: 403 }
      );
    }

    // Update the user's role in the profiles table
    const { data, error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId)
      .select();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
