import { createClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/validations/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, full_name, phone_number } = result.data;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          phone_number,
        },
      },
    });

    if (error) {
      let friendlyMessage = error.message;
      
      // Translate technical DB errors for the end user
      if (error.message.toLowerCase().includes("database error") || error.message.toLowerCase().includes("unexpected_failure")) {
        friendlyMessage = "We encountered a temporary issue while setting up your account profile. Your account may have been created, but please try to log in or contact support if you have issues.";
      }

      return NextResponse.json(
        { success: false, message: friendlyMessage },
        { status: 400 }
      );
    }

    // Return sanitized user. Update profile if needed.
    if (phone_number) {
        await supabase
          .from('profiles')
          .update({ phone: phone_number }) // Fixed: changed from phone_number to phone
          .eq('id', data.user?.id);
    }
    
    // Fetch updated profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user?.id)
        .single();
    
    const sanitizedUser = {
      id: data.user?.id,
      email: data.user?.email,
      full_name: profile?.full_name || full_name,
      role: profile?.role,
    };

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please check your email for verification.",
      data: sanitizedUser,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
