import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createRequestSchema } from "@/lib/validations/requests";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { user, profile } = session;
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    let dbQuery = supabase
      .from("lost_requests")
      .select("*")
      .order("created_at", { ascending: false });

    // Role-based filtering
    if (profile.role !== "admin") {
      dbQuery = dbQuery.eq("user_id", user.id);
    } else {
      // Admin filters
      const status = searchParams.get("status");
      if (status) dbQuery = dbQuery.eq("status", status);
    }

    const { data, error } = await dbQuery;

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: requestData, error } = await supabase
      .from("lost_requests")
      .insert({
        ...validation.data,
        user_id: session.user.id,
        status: "submitted",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
    
    // Attempt to match with existing found IDs
    // Optional feature: auto-match logic
    /*
    const { data: matches } = await supabase
      .from("ids_found")
      .select("*")
      .eq("registration_number", validation.data.registration_number)
      .eq("status", "pending") // Or verified
      .limit(1);

    if (matches && matches.length > 0) {
      // Notify admin or user about match
    }
    */

    return NextResponse.json({ success: true, message: "Request submitted", data: requestData });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
