
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { forumCommentSchema } from "@/lib/validations/forum";

// GET /api/forum/[id]/comments - List comments for a post
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const postId = params.id;

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

  // Transform author if necessary, but frontend can handle it
  return NextResponse.json(comments);
}

// POST /api/forum/[id]/comments - Add a comment
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const postId = params.id;

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
  
  // 5. Update comments count (manual increment for now)
  const { data: post } = await supabase.from("forum_posts").select("comments_count").eq("id", postId).single();
  if (post) {
      await supabase.from("forum_posts").update({ comments_count: (post.comments_count || 0) + 1 }).eq("id", postId);
  }

  return NextResponse.json(comment, { status: 201 });
}
