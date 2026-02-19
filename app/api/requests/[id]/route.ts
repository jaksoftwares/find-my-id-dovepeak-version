import { getSessionUser, requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updateRequestSchema } from "@/lib/validations/requests";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const { id } = params;
    const body = await request.json();
    const validation = updateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { user, profile } = session;
    const supabase = await createClient();

    const { data: requestData, error: fetchError } = await supabase
      .from("lost_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !requestData) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 }
      );
    }

    // Authorization check
    if (profile.role !== "admin") {
      if (requestData.user_id !== user.id) {
        return NextResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 }
        );
      }
      if (requestData.status !== "submitted") {
        return NextResponse.json(
          { success: false, message: "Cannot edit request once matched or closed" },
          { status: 400 }
        );
      }
    }

    const { error } = await supabase
      .from("lost_requests")
      .update(validation.data)
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Request updated" });
  } catch (error) {
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
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const { id } = params;
    const { user, profile } = session;
    const supabase = await createClient();

    const { data: requestData, error: fetchError } = await supabase
      .from("lost_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !requestData) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 }
      );
    }

    if (profile.role !== "admin") {
      if (requestData.user_id !== user.id) {
        return NextResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 }
        );
      }
      if (requestData.status === "matched") {
        return NextResponse.json(
          { success: false, message: "Cannot delete matched request" },
          { status: 400 }
        );
      }
    }

    const { error } = await supabase
      .from("lost_requests")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Request deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
