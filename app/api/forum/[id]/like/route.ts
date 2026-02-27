
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/forum/[id]/like - Toggle like on a post
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: postId } = await params;

  // 1. Check Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Check if already liked
  const { data: existingLike } = await supabase
    .from("forum_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .single();

  if (existingLike) {
    // Un-like
    const { error } = await supabase.from("forum_likes").delete().eq("id", existingLike.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ liked: false });
  } else {
    // Like
    const { error } = await supabase.from("forum_likes").insert({
      post_id: postId,
      user_id: user.id
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ liked: true });
  }
}
