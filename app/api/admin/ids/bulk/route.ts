import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { ids, updateData } = await request.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: "No IDs provided" }, { status: 400 });
    }

    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("ids_found")
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .in("id", ids)
      .select();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${ids.length} records updated successfully`,
      data
    });
  } catch (error) {
    console.error("Error in PUT /api/admin/ids/bulk:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireSuperAdmin();
    if (auth.error) return auth.error;

    const { ids } = await request.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: "No IDs provided" }, { status: 400 });
    }

    const supabase = await createClient();
    
    const { error } = await supabase
      .from("ids_found")
      .delete()
      .in("id", ids);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${ids.length} records deleted successfully`
    });
  } catch (error) {
    console.error("Error in DELETE /api/admin/ids/bulk:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
