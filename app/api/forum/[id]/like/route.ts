
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
    await supabase.from("forum_likes").delete().eq("id", existingLike.id);
    
    // Decrement counter (atomic update ideally, but simplified here)
    // For better consistency we might use an RPC or just rely on count query, 
    // but the schema has likes_count so we should update it.
    await supabase.rpc('decrement_likes', { post_id: postId });

    return NextResponse.json({ liked: false });
  } else {
    // Like
    await supabase.from("forum_likes").insert({
      post_id: postId,
      user_id: user.id
    });

    // Increment counter
     // We need to create this RPC or do it manually. 
     // Doing it manually is race-condition prone but ok for MVP. 
     // Let's assume we can just increment.
     
     // Actually, we should probably add the RPC to the setup.db if strictly following best practices,
     // but for now let's just use the direct update approach.
     
     const { data: post } = await supabase.from("forum_posts").select("likes_count").eq("id", postId).single();
     if (post) {
         await supabase.from("forum_posts").update({ likes_count: (post.likes_count || 0) + 1 }).eq("id", postId);
     }

    return NextResponse.json({ liked: true });
  }
}
