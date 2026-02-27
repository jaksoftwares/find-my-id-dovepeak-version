import { getSessionUser, requireAdmin } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { createClient } from "@/lib/supabase/server";
import { createIdSchema } from "@/lib/validations/ids";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = await createClient();
    const session = await getSessionUser();
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24");
    const offset = (page - 1) * limit;

    // Filters
    const id_type = searchParams.get("id_type");
    const status = searchParams.get("status");
    const query = searchParams.get("query"); // implementation for full_name or reg_number search

    let dbQuery = supabase
      .from("ids_found")
      .select("*", { count: "exact" });

    // Role-based visibility
    if (session?.profile.role === "admin") {
      // Admin sees specific filters or all
      if (status) dbQuery = dbQuery.eq("status", status);
    } else {
      // Public/Student sees only verified and visible
      dbQuery = dbQuery.eq("status", "verified").eq("visibility", true);
    }

    // Apply filters
    if (id_type && id_type !== "all") dbQuery = dbQuery.eq("id_type", id_type);
    if (query) {
      dbQuery = dbQuery.or(`full_name.ilike.%${query}%,registration_number.ilike.%${query}%,serial_number.ilike.%${query}%`);
    }

    // Sorting
    dbQuery = dbQuery.order("created_at", { ascending: false });

    // Pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data, count, error } = await dbQuery;

    if (error) {
      console.error("Error fetching IDs from database:", error);
      return NextResponse.json({ success: false, message: "Failed to fetch IDs. Please try again later." }, { status: 500 });
    }
    
    // Mask sensitive data for non-admins
    const maskedData = data?.map(item => {
      if (session?.profile.role !== "admin") {
        return {
          ...item,
          registration_number: item.registration_number ? item.registration_number.replace(/.(?=.{4})/g, "*") : null,
        };
      }
      return item;
    });

    return NextResponse.json({
      success: true,
      data: maskedData,
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });

  } catch (error) {
    console.error("Error in GET /api/ids:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { session } = auth;

    const formData = await request.formData();
    const id_type = formData.get("id_type") as string;
    const full_name = formData.get("full_name") as string;
    const registration_number = formData.get("registration_number") as string;
    const sighting_location = formData.get("sighting_location") as string;
    const holding_location = formData.get("holding_location") as string;
    const description = formData.get("description") as string;
    const file = formData.get("image") as File;

    // Validate using Zod
    const payload = {
      id_type,
      full_name,
      registration_number,
      sighting_location,
      holding_location,
      description,
      // Default visibility true
      visibility: true,
    };
    
    const validation = createIdSchema.omit({ image_url: true }).safeParse(payload);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Image is required" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await uploadToCloudinary(buffer, "ids_found");

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ids_found")
      .insert({
        ...payload,
        image_url: imageUrl,
        created_by: session.user.id,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating ID in database:", error);
      return NextResponse.json({ success: false, message: "Failed to create ID. Please try again later." }, { status: 500 });
    }

    // Audit Log
    await supabase.from("audit_logs").insert({
      actor: session.user.id,
      action: "create_id",
      entity_type: "ids_found",
      entity_id: data.id,
      details: { id_type, full_name },
    });

    return NextResponse.json({
      success: true,
      message: "ID created successfully",
      data,
    });

  } catch (error) {
    console.error("Error in POST /api/ids:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
