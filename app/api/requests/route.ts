import { getSessionUser } from "@/lib/auth";
import { createClient, createAdminClient } from "@/lib/supabase/server";
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
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    const formData = await request.formData();
    
    // Extract all fields from FormData
    const payload: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (key !== 'image') payload[key] = value;
    });

    const validation = createRequestSchema.safeParse(payload);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    let imageUrl = null;
    const file = formData.get("image") as File;
    
    if (file && file.size > 0) {
      const { uploadToCloudinary } = await import("@/lib/cloudinary");
      const buffer = Buffer.from(await file.arrayBuffer());
      imageUrl = await uploadToCloudinary(buffer, "requests");
    }

    const adminSupabase = await createAdminClient();
    const { data: requestData, error } = await adminSupabase
      .from("lost_requests")
      .insert({
        ...validation.data,
        user_id: authUser?.id || null,
        image_url: imageUrl,
        status: "submitted",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
    
    // Send email notifications
    try {
      const { sendEmail, emailTemplates } = await import("@/lib/email");
      
      // 1. Notify the User
      const userEmail = validation.data.contact_email;
      if (userEmail) {
        const userTemplate = emailTemplates.lostReportSubmitted(
          validation.data.full_name,
          `${validation.data.id_type.replace('_', ' ')}: ${validation.data.registration_number}`
        );
        await sendEmail({
          to: userEmail,
          subject: userTemplate.subject,
          htmlBody: userTemplate.html,
        });
      }

      // 2. Notify Admins
      const adminTemplate = emailTemplates.lostReportAdmin(
        "Admin",
        validation.data.contact_email || "Anonymous User",
        `${validation.data.id_type.replace('_', ' ')}: ${validation.data.registration_number}`
      );
      // Sending to a generic admin email or fetching from profiles
      const { data: admins } = await supabase.from("profiles").select("email").eq("role", "admin");
      if (admins && admins.length > 0) {
        for (const admin of admins) {
          if (admin.email) {
            await sendEmail({
              to: admin.email,
              subject: adminTemplate.subject,
              htmlBody: adminTemplate.html,
            });
          }
        }
      }
    } catch (emailError) {
      console.error("Queueing email notification failed:", emailError);
      // Don't fail the request if email fails
    }
    
    return NextResponse.json({ success: true, message: "Request submitted successfully", data: requestData });
  } catch (error) {
    console.error("Error in POST /api/requests:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
