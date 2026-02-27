
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  const limit = parseInt(searchParams.get("limit") || "50");

  let query = supabase
    .from("forum_comments")
    .select(`
      *,
      author:profiles(full_name, role),
      post:forum_posts(title)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (postId) {
    query = query.eq("post_id", postId);
  }

  const { data: comments, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(comments);
}
