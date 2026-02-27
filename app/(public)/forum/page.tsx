
"use client";

import { useForum } from "@/hooks/useForum";
import { CreatePostModal } from "@/components/forum/CreatePostModal";
import { MessageSquare, ThumbsUp, Users, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { ForumPostCard } from "@/components/forum/ForumPostCard";

export default function ForumPage() {
  const { posts, loading, createPost, likePost, fetchPosts, deletePost } = useForum();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [forumStats, setForumStats] = useState({ members: "1.2k", discussions: "450", solutions: "89" });

  useEffect(() => {
    fetch("/api/forum/stats")
      .then(res => res.json())
      .then(data => {
        setForumStats({
          members: data.totalMembers > 1000 ? (data.totalMembers / 1000).toFixed(1) + 'k' : data.totalMembers.toString(),
          discussions: data.totalPosts.toString(),
          solutions: data.totalLikes.toString()
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
        fetchPosts(filter, search);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
  }, [filter, search]);

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-6">
           <div className="bg-white p-6 rounded-xl border border-zinc-200 sticky top-24">
              <h3 className="font-bold text-lg mb-4 text-foreground">Categories</h3>
              <nav className="flex flex-col space-y-2">
                 {["All", "General", "Suggestions", "Lost & Found", "Announcements"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        filter === cat 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "text-muted-foreground hover:bg-zinc-50 hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                 ))}
              </nav>
           </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6">
           {/* Header */}
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-zinc-200">
              <div>
                 <h1 className="text-2xl font-bold text-foreground">Community Forum</h1>
                 <p className="text-muted-foreground text-sm">Connect with fellow students and share ideas.</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                 <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search discussions..." 
                      className="pl-9 bg-zinc-50"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                 </div>
                 <CreatePostModal onCreate={createPost} />
              </div>
           </div>

           {/* Stats Cards (Optional for vibe) */}
           <div className="grid grid-cols-3 gap-4">
              <Card className="bg-primary/5 border-primary/20 shadow-none">
                 <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Users className="h-6 w-6 text-primary mb-2" />
                    <span className="text-2xl font-bold text-foreground">{forumStats.members}</span>
                    <span className="text-xs text-muted-foreground">Members</span>
                 </CardContent>
              </Card>
              <Card className="bg-secondary/10 border-secondary/20 shadow-none">
                 <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <MessageSquare className="h-6 w-6 text-secondary-foreground mb-2" />
                    <span className="text-2xl font-bold text-foreground">{forumStats.discussions}</span>
                    <span className="text-xs text-muted-foreground">Discussions</span>
                 </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200 shadow-none">
                 <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <ThumbsUp className="h-6 w-6 text-green-600 mb-2" />
                    <span className="text-2xl font-bold text-foreground">{forumStats.solutions}</span>
                    <span className="text-xs text-muted-foreground">Solutions</span>
                 </CardContent>
              </Card>
           </div>

           {/* Posts List */}
           <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">Loading discussions...</div>
              ) : posts.length > 0 ? (
                   posts.map((post) => (
                    <ForumPostCard 
                      key={post.id} 
                      post={post} 
                      onLike={() => likePost(post.id)} 
                      onDelete={() => deletePost(post.id)}
                    />
                 ))
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-zinc-200">
                   <p className="text-muted-foreground">No discussions found in this category.</p>
                </div>
              )}
           </div>
        </main>
      </div>
    </div>
  );
}
