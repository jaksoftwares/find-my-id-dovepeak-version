
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/forum/comments/[id]/vote - Toggle like/dislike on a comment
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: commentId } = await params;
  
  const body = await req.json().catch(() => ({}));
  const voteType = body.type === 'dislike' ? 'dislike' : 'like';

  // 1. Check Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Check for existing vote
  const { data: existingVote } = await supabase
    .from("forum_comment_votes")
    .select("id, vote_type")
    .eq("comment_id", commentId)
    .eq("user_id", user.id)
    .single();

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
        // Toggle off
        const { error } = await supabase.from("forum_comment_votes").delete().eq("id", existingVote.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ newState: null });
    } else {
        // Switch type
        const { error } = await supabase.from("forum_comment_votes").update({ vote_type: voteType }).eq("id", existingVote.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ newState: voteType });
    }
  } else {
    // New vote
    const { error } = await supabase.from("forum_comment_votes").insert({
      comment_id: commentId,
      user_id: user.id,
      vote_type: voteType
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ newState: voteType });
  }
}
