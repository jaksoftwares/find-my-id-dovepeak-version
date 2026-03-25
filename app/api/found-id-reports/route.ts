import { requireAdmin, isAdminRole } from "@/lib/auth"; // For GET
import { uploadToCloudinary } from "@/lib/cloudinary";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { createSubmissionSchema } from "@/lib/validations/submissions";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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

    const adminSupabase = await createAdminClient();
    const { data, error } = await adminSupabase
      .from("public_found_reports")
      .insert({
        ...validation.data,
        image_url: imageUrl,
        approved: false,
        finder_id: user?.id || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Send notifications
    try {
      const { sendEmail, emailTemplates } = await import("@/lib/email");
      const idType = validation.data.id_type || "ID";
      const fullName = validation.data.full_name || "Unknown";
      const contactInfo = validation.data.contact_info || "";
      const idName = `${idType.replace('_', ' ')}: ${fullName}`;
      // Fetch site settings for branding and routing
      const { data: settings } = await supabase.from("settings").select("*").single();
      const senderName = settings?.sender_name || "JKUAT Customer Service Center";
      const routingEmail = settings?.admin_email_found_ids || settings?.contact_email;

      // Notify Admins & Super Admins (Routing)
      if (routingEmail) {
        const template = emailTemplates.foundReportSubmittedAdmin("Administrator", idName, contactInfo || "Not provided");
        await sendEmail({
          to: routingEmail,
          subject: template.subject,
          htmlBody: template.html,
          fromName: senderName,
          replyTo: (contactInfo && contactInfo.includes("@")) ? contactInfo : routingEmail
        });
      } else {
        // Fallback to all admins if no routing email is set
        const { data: adminProfiles } = await supabase.from("profiles").select("email, full_name").in("role", ["admin", "super_admin"]);
        if (adminProfiles) {
          for (const admin of adminProfiles) {
            if (admin.email) {
              const template = emailTemplates.foundReportSubmittedAdmin(admin.full_name || "Admin", idName, contactInfo || "Not provided");
              await sendEmail({
                to: admin.email,
                subject: template.subject,
                htmlBody: template.html,
                fromName: senderName,
                replyTo: (contactInfo && contactInfo.includes("@")) ? contactInfo : admin.email
              });
            }
          }
        }
      }

      // Notify Submitter acknowledgment if contactInfo looks like an email
      if (contactInfo && contactInfo.includes("@")) {
         const userTemplate = emailTemplates.foundReportSubmittedUser("", idName);
         await sendEmail({
            to: contactInfo,
            subject: userTemplate.subject,
            htmlBody: userTemplate.html,
            fromName: senderName,
            replyTo: routingEmail
         });
      }
    } catch (notificationError) {
      console.error("Found ID Notification Error:", notificationError);
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = isAdminRole(profile?.role);
    const { searchParams } = new URL(request.url);
    const approved = searchParams.get("approved");

    let query = supabase.from("public_found_reports").select("*").order("created_at", { ascending: false });

    // If not admin, only show user's own submissions
    if (!isAdmin) {
      query = query.eq("finder_id", user.id);
    } else if (approved !== null) {
      // Admins can filter by approval status
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
