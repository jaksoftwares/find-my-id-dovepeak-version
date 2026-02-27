
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  // 1. Get total posts
  const { count: totalPosts } = await supabase
    .from("forum_posts")
    .select("*", { count: "exact", head: true });

  // 2. Get total comments
  const { count: totalComments } = await supabase
    .from("forum_comments")
    .select("*", { count: "exact", head: true });

  // 3. Get total likes
  const { count: totalLikes } = await supabase
    .from("forum_likes")
    .select("*", { count: "exact", head: true });

  // 4. Get active users in forum (who posted or commented)
  // This is a bit more complex, but for MVP we can just do a rough estimate or skip
  // Let's just return counts for now.

  return NextResponse.json({
    totalPosts: totalPosts || 0,
    totalComments: totalComments || 0,
    totalLikes: totalLikes || 0,
    categories: [
        { name: 'General', count: await getCountForCategory(supabase, 'General') },
        { name: 'Suggestions', count: await getCountForCategory(supabase, 'Suggestions') },
        { name: 'Lost & Found', count: await getCountForCategory(supabase, 'Lost & Found') },
        { name: 'Announcements', count: await getCountForCategory(supabase, 'Announcements') },
    ]
  });
}

async function getCountForCategory(supabase: any, category: string) {
    const { count } = await supabase
        .from("forum_posts")
        .select("*", { count: "exact", head: true })
        .eq("category", category);
    return count || 0;
}
