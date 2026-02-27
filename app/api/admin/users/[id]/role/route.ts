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
    const { role } = body;

    if (role !== "admin" && role !== "student") {
        return NextResponse.json(
            { success: false, message: "Invalid role" },
            { status: 400 }
        );
    }

    const supabase = await createClient();

    // Prevent self-demotion (simplest safeguard)
    if (id === session.user.id && role !== "admin") {
         // Check if last admin
         const { count } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("role", "admin");
         
         if (count === 1) {
             return NextResponse.json(
                 { success: false, message: "Cannot demote the last admin" },
                 { status: 400 }
             );
         }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", id);

    if (error) {
       return NextResponse.json(
         { success: false, message: error.message },
         { status: 500 }
       );
    }

    // Audit Log
    await supabase.from("audit_logs").insert({
        actor: session.user.id,
        action: "update_user_role",
        entity_type: "profiles",
        entity_id: id,
        details: { new_role: role }
    });

    return NextResponse.json({ success: true, message: "User role updated" });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
