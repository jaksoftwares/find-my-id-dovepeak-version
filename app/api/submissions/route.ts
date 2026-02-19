import { requireAdmin } from "@/lib/auth"; // For GET
import { uploadToCloudinary } from "@/lib/cloudinary";
import { createClient } from "@/lib/supabase/server";
import { createSubmissionSchema } from "@/lib/validations/submissions";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const id_type = formData.get("id_type");
    const full_name = formData.get("full_name");
    const registration_number = formData.get("registration_number");
    const location_found = formData.get("location_found");
    const contact_info = formData.get("contact_info");
    const file = formData.get("image") as File;

    const payload = {
      id_type,
      full_name,
      registration_number,
      location_found,
      contact_info,
    };

    const validation = createSubmissionSchema.omit({ image_url: true }).safeParse(payload);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Image is required" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await uploadToCloudinary(buffer, "submissions");

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("submissions")
      .insert({
        ...validation.data,
        image_url: imageUrl,
        approved: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Submission received. Pending admin approval.",
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const approved = searchParams.get("approved");

    let query = supabase.from("submissions").select("*").order("created_at", { ascending: false });

    if (approved !== null) {
      query = query.eq("approved", approved === "true");
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
