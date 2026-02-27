
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { forumCommentSchema } from "@/lib/validations/forum";

// GET /api/forum/[id]/comments - List comments for a post
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: postId } = await params;

  const { data: { user } } = await supabase.auth.getUser();

  const { data: comments, error } = await supabase
    .from("forum_comments")
    .select(`
      *,
      author:profiles(full_name, role)
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Attach user_vote if logged in
  let transformedComments = comments;
  if (user) {
    const { data: userVotes } = await supabase
      .from("forum_comment_votes")
      .select("comment_id, vote_type")
      .eq("user_id", user.id);
    
    const voteMap = new Map(userVotes?.map(v => [v.comment_id, v.vote_type]));
    transformedComments = (comments || []).map(comment => ({
      ...comment,
      user_vote: voteMap.get(comment.id) || null
    }));
  }

  return NextResponse.json(transformedComments);
}

// POST /api/forum/[id]/comments - Add a comment
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

  // 2. Parse Body
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 3. Validate
  const validation = forumCommentSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
  }

  const { content } = validation.data;

  // 4. Insert
  const { data: comment, error: dbError } = await supabase
    .from("forum_comments")
    .insert({
      post_id: postId,
      author_id: user.id,
      content,
    })
    .select(`
      *,
      author:profiles(full_name, role)
    `)
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
  
  return NextResponse.json(comment, { status: 201 });
}
