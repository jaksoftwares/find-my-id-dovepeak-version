import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url, phone')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return NextResponse.json(
      { success: false, message: "Profile not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      ...profile,
      email: user.email,
    },
  });
}
