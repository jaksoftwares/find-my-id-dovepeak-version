import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No user" });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    
    // Try to count all lost_requests (uses current user's RLS)
    const { count: userViewCount, error: userViewError } = await supabase
      .from("lost_requests")
      .select("*", { count: "exact", head: true });

    // Try to count all lost_requests (using admin check bypass if possible)
    // Actually, we can just try to see what's in there.
    
    return NextResponse.json({
      currentUser: user.email,
      role: profile?.role,
      userViewCount,
      userViewError,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
