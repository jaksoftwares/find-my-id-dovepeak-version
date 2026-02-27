import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || {},
    });
  } catch (error) {
    console.error("Error in GET /api/admin/settings:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await request.json();
    const supabase = await createClient();

    // Check if settings exist
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .limit(1)
      .single();

    let result;
    if (existing) {
      // Update existing settings
      const { data, error } = await supabase
        .from("settings")
        .update({
          site_name: body.site_name,
          site_description: body.site_description,
          contact_email: body.contact_email,
          support_phone: body.support_phone,
          address: body.address,
          notifications_enabled: body.notifications_enabled,
          email_notifications: body.email_notifications,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from("settings")
        .insert({
          site_name: body.site_name,
          site_description: body.site_description,
          contact_email: body.contact_email,
          support_phone: body.support_phone,
          address: body.address,
          notifications_enabled: body.notifications_enabled,
          email_notifications: body.email_notifications,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        );
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in PUT /api/admin/settings:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
