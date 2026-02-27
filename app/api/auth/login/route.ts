import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: result.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const supabase = await createClient();

    const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    // Fetch full profile info with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url, phone')
      .eq('id', user?.id)
      .single();

    if (profileError) {
       console.error("Profile fetch error during login:", profileError);
       // We can still proceed but with minimal user info if profile fails?
       // But profile should exist via trigger.
    }

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        session,
        user: {
          ...profile,
          ...user,
          email: user?.email,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
