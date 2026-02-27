import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createClaimSchema } from "@/lib/validations/claims";
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
      .from("claims")
      .select(`
        *,
        ids_found (
          full_name,
          registration_number,
          id_type,
          image_url
        ),
        profiles!claimant (
          full_name,
          phone
        )
      `)
      .order("created_at", { ascending: false });

    if (profile.role !== "admin") {
      dbQuery = dbQuery.eq("claimant", user.id);
    } else {
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
    const validation = createClaimSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { item_id, proof_description } = validation.data;
    const { user } = session;
    const supabase = await createClient();

    // Verify ID exists and verified
    const { data: item, error: itemError } = await supabase
      .from("ids_found")
      .select("*")
      .eq("id", item_id)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { success: false, message: "Item not found" },
        { status: 404 }
      );
    }

    if (item.status !== "verified") {
      return NextResponse.json(
        { success: false, message: "Cannot claim an unverified or already claimed item" },
        { status: 400 }
      );
    }

    // Check for existing pending claim by user
    const { data: existingClaim } = await supabase
      .from("claims")
      .select("*")
      .eq("id_found", item_id)
      .eq("claimant", user.id)
      .neq("status", "rejected")
      .single();

    if (existingClaim) {
      return NextResponse.json(
        { success: false, message: "You already have an active claim for this item" },
        { status: 400 }
      );
    }

    const { data: claim, error: claimError } = await supabase
      .from("claims")
      .insert({
        id_found: item_id,
        claimant: user.id,
        proof_description,
        status: "pending",
      })
      .select()
      .single();

    if (claimError) {
      return NextResponse.json(
        { success: false, message: claimError.message },
        { status: 500 }
      );
    }

    // Trigger notifications (async)
    triggerClaimNotifications(user, session.profile, item_id);

    return NextResponse.json({ success: true, message: "Claim submitted successfully", data: claim });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// Helper to trigger notifications after response
async function triggerClaimNotifications(user: any, claimantProfile: any, itemId: string) {
  try {
    const supabase = await createClient();
    
    // Get item details
    const { data: item } = await supabase
      .from("ids_found")
      .select("full_name")
      .eq("id", itemId)
      .single();

    if (!item) return;

    const title = "New ID Claim";
    const message = `${claimantProfile.full_name} has claimed the ID for ${item.full_name}.`;

    // 1. In-app notifications for admins
    const { notifyAdmins } = await import("@/lib/notifications");
    await notifyAdmins(title, message);

    // 2. Email notifications for admins
    const { sendEmail, emailTemplates } = await import("@/lib/email");
    
    // Get admins with emails
    const { data: admins } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "admin");

    if (admins && admins.length > 0) {
      // Get admin emails from auth.admin.listUsers() - Note: this requires service role in some contexts, 
      // but if we are in a route handler with enough privileges it might work or we can fetch from profiles if emails are there.
      // Profiles has email based on setup.db
      const { data: adminProfiles } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("role", "admin");

      if (adminProfiles) {
        for (const admin of adminProfiles) {
          if (admin.email) {
            const template = emailTemplates.claimSubmittedAdmin(admin.full_name, claimantProfile.full_name, item.full_name);
            await sendEmail({
              to: admin.email,
              subject: template.subject,
              htmlBody: template.html
            });
          }
        }
      }
    }
  } catch (err) {
    console.error("Error in triggerClaimNotifications:", err);
  }
}
