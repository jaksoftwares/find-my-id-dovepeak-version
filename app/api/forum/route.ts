
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { forumPostSchema } from "@/lib/validations/forum";

// GET /api/forum - List all posts
export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  let query = supabase
    .from("forum_posts")
    .select(`
      *,
      author:profiles(full_name, role)
    `)
    .order("created_at", { ascending: false });

  if (category && category !== "All") {
    query = query.eq("category", category);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  const { data: posts, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Attach user_vote if logged in
  let transformedPosts = posts;
  if (user) {
    const { data: userVotes } = await supabase
      .from("forum_likes")
      .select("post_id, vote_type")
      .eq("user_id", user.id);
    
    const voteMap = new Map(userVotes?.map(v => [v.post_id, v.vote_type]));
    transformedPosts = posts.map(post => ({
      ...post,
      user_vote: voteMap.get(post.id) || null
    }));
  }
  
  return NextResponse.json(transformedPosts);
}

// POST /api/forum - Create a new post
export async function POST(req: Request) {
  const supabase = await createClient();
  
  // 1. Check Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse Body using Standard Request
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 3. Validate Validation
  const validation = forumPostSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
  }

  const { title, content, category } = validation.data;

  // 4. Insert into DB
  const { data: post, error: dbError } = await supabase
    .from("forum_posts")
    .insert({
      author_id: user.id,
      title,
      content,
      category
    })
    .select(`
      *,
      author:profiles(full_name, role)
    `)
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(post, { status: 201 });
}
