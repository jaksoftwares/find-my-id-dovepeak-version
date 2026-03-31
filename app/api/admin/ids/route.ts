import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabaseAdmin = await createAdminClient();

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    const id_type = searchParams.get("id_type");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Simple query without joins to avoid stack depth issues
    let dbQuery = supabaseAdmin
      .from("ids_found")
      .select("*", { count: "exact" });

    // Apply filters
    if (id_type && id_type !== "all") {
      dbQuery = dbQuery.eq("id_type", id_type);
    }
    if (status && status !== "all") {
      dbQuery = dbQuery.eq("status", status);
    }
    if (search) {
      dbQuery = dbQuery.or(`full_name.ilike.%${search}%,serial_number.ilike.%${search}%`);
    }

    // Sorting
    dbQuery = dbQuery.order("created_at", { ascending: false });

    // Pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    // Add timeout to prevent long-running queries
    dbQuery = dbQuery.limit(limit);

    const { data, count, error } = await dbQuery;

    if (error) {
      console.error("Error fetching IDs:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/admin/ids:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const formData = await request.formData();
    const file = formData.get("image") as File;
    const idType = formData.get("id_type") as string;

    const { getIDPlaceholder } = await import("@/lib/utils");
    let imageUrl = getIDPlaceholder(idType);

    if (file && file.size > 0) {
      const { uploadToCloudinary } = await import("@/lib/cloudinary");
      const buffer = Buffer.from(await file.arrayBuffer());
      imageUrl = await uploadToCloudinary(buffer, "ids");
    }

    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabaseAdmin = await createAdminClient();
    
    // Extract other fields
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (key !== 'image') data[key] = value;
    });

    const { data: newId, error } = await supabaseAdmin
      .from("ids_found")
      .insert({
        ...data,
        image_url: imageUrl,
        approved_by: auth.session.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating ID:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "ID record created successfully",
      data: newId,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/ids:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
