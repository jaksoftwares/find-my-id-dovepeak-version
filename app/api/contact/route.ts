import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Save to database
    const { data: contactMsg, error } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        subject,
        message,
        status: 'unread'
      })
      .select()
      .single();

    if (error) {
       console.error("Database error saving contact message:", error);
       return NextResponse.json(
         { success: false, message: "Failed to save message" },
         { status: 500 }
       );
    }

    // 2. Trigger Email Notification (Async-ish)
    try {
      const { data: settings } = await supabase
        .from("settings")
        .select("*")
        .single();

      const senderName = settings?.sender_name || "JKUAT Customer Service Center";
      const routingEmail = settings?.admin_email_messages || settings?.contact_email;

      if (routingEmail) {
        const template = emailTemplates.customNotification(
          "Admin",
          `A new contact message has been received from <strong>${name}</strong> (${email}).<br/><br/>
          <strong>Subject:</strong> ${subject}<br/>
          <strong>Message:</strong><br/>${message}`
        );

        await sendEmail({
          to: routingEmail,
          subject: `New Contact Message: ${subject}`,
          htmlBody: template.html,
          fromName: senderName,
          replyTo: email // Admin can reply directly to the sender
        });
      } else {
        // Fallback to all admins if no routing email is set
        const { data: adminProfiles } = await supabase.from("profiles").select("email, full_name").in("role", ["admin", "super_admin"]);
        if (adminProfiles) {
          for (const admin of adminProfiles) {
            if (admin.email) {
               const template = emailTemplates.customNotification(
                admin.full_name || "Admin",
                `A new contact message has been received from <strong>${name}</strong> (${email}).<br/><br/>
                <strong>Subject:</strong> ${subject}<br/>
                <strong>Message:</strong><br/>${message}`
              );
              await sendEmail({
                to: admin.email,
                subject: `New Contact Message: ${subject}`,
                htmlBody: template.html,
                fromName: senderName,
                replyTo: email
              });
            }
          }
        }
      }
    } catch (emailErr) {
      console.error("Email notification error for contact message:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      data: contactMsg,
    });
  } catch (error) {
    console.error("Error in POST /api/contact:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
