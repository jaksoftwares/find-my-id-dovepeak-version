import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schema for creating admin
const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2),
});

// Create admin client with service role key
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log("Supabase URL:", supabaseUrl ? "set" : "NOT SET");
  console.log("Service Role Key:", serviceKey ? "set" : "NOT SET");
  
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase environment variables");
  }
  
  return createClient(supabaseUrl, serviceKey);
}

export async function POST(request: Request) {
  try {
    console.log("Starting create-admin...");
    
    const body = await request.json();
    console.log("Request body:", body);
    
    const result = createAdminSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: result.error.issues },
        { status: 400 }
      );
    }

    const { email, password, full_name } = result.data;
    
    let supabase;
    try {
      supabase = createAdminClient();
      console.log("Supabase admin client created");
    } catch (err: any) {
      console.error("Failed to create supabase client:", err.message);
      return NextResponse.json(
        { success: false, message: "Failed to create admin client: " + err.message },
        { status: 500 }
      );
    }

    // Create the user with admin role
    const { data: user, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
      },
    });

    if (error) {
      console.error("Error creating user:", error.message);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    console.log("User created:", user?.user?.id);

    // Update the profile to have admin role
    if (user?.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role: "admin", full_name })
        .eq("id", user.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError.message);
        return NextResponse.json(
          { success: false, message: "User created but role update failed: " + profileError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      data: {
        user_id: user?.user?.id,
        email: user?.user?.email,
        role: "admin",
      },
    });
  } catch (error: any) {
    console.error("Unexpected error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
