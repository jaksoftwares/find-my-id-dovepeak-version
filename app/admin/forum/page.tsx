
"use client";

import { useForum, ForumPost } from "@/hooks/useForum";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Trash2, 
  Eye, 
  MessageSquare, 
  ThumbsUp, 
  Search,
  MessageCircle,
  TrendingUp,
  Users as UsersIcon,
  Filter
} from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CommunityStats {
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  categories: { name: string; count: number }[];
}

interface ForumComment {
    id: string;
    content: string;
    created_at: string;
    author: { full_name: string; role: string };
    post: { title: string };
}

export default function AdminCommunityPage() {
  const { posts, loading: postsLoading, fetchPosts } = useForum();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchStats();
    if (activeTab === "comments") {
        fetchGlobalComments();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/forum/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const fetchGlobalComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await fetch("/api/forum/comments");
      const data = await res.json();
      setComments(data);
    } catch (error) {
      toast.error("Failed to load comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const res = await fetch(`/api/forum/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
      toast.success("Post deleted successfully");
      fetchPosts();
      fetchStats();
    } catch (error) {
      toast.error("Error deleting post");
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      const res = await fetch(`/api/forum/comments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete comment");
      toast.success("Comment deleted");
      fetchGlobalComments();
      fetchStats();
    } catch (error) {
      toast.error("Error deleting comment");
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Community Management</h1>
        <p className="text-muted-foreground">Monitor and moderate the community forum and user interactions.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-100 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Discussions</TabsTrigger>
          <TabsTrigger value="comments">Recent Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-sm border-zinc-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Discussions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalPosts || 0}</div>
                <p className="text-xs text-muted-foreground">Active discussions in forum</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-zinc-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalComments || 0}</div>
                <p className="text-xs text-muted-foreground">Total engagement</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-zinc-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalLikes || 0}</div>
                <p className="text-xs text-muted-foreground">Community approvals</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mt-6">
             <Card className="shadow-sm border-zinc-200">
                <CardHeader>
                    <CardTitle className="text-lg">Category Distribution</CardTitle>
                    <CardDescription>Most popular topics in the community</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {stats?.categories.map((cat) => (
                        <div key={cat.name} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{cat.name}</span>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-32 bg-zinc-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary" 
                                        style={{ width: `${(cat.count / (stats.totalPosts || 1)) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs font-bold w-4">{cat.count}</span>
                            </div>
                        </div>
                    ))}
                </CardContent>
             </Card>
             <Card className="shadow-sm border-zinc-200">
                <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                    <CardDescription>Common moderation tasks</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start gap-2 h-20" asChild>
                        <a href="/forum" target="_blank">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <div className="text-left">
                                <div className="font-bold">View Forum</div>
                                <div className="text-[10px] text-muted-foreground">Public side</div>
                            </div>
                        </a>
                    </Button>
                    <Button variant="outline" className="justify-start gap-2 h-20" onClick={() => setActiveTab("posts")}>
                        <Filter className="h-5 w-5 text-secondary-foreground" />
                        <div className="text-left">
                            <div className="font-bold">Filter Posts</div>
                            <div className="text-[10px] text-muted-foreground">By category or author</div>
                        </div>
                    </Button>
                </CardContent>
             </Card>
          </div>
        </TabsContent>

        <TabsContent value="posts">
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b bg-zinc-50/30">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search posts or authors..." 
                  className="pl-9 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50/50">
                  <TableHead className="w-[300px]">Post Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {postsLoading ? (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell></TableRow>
                ) : filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{post.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{post.content}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600">
                            {post.author.full_name?.charAt(0) || '?'}
                          </div>
                          <span className="text-sm font-medium">{post.author.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{post.category}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5"><ThumbsUp className="h-3 w-3" /> {post.likes_count || 0}</span>
                          <span className="flex items-center gap-0.5"><MessageSquare className="h-3 w-3" /> {post.comments_count || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(post.created_at), 'MMM dd')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild>
                             <a href="/forum" target="_blank"><Eye className="h-4 w-4" /></a>
                           </Button>
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Discussion?</AlertDialogTitle>
                                  <AlertDialogDescription>This will remove the post and all comments permanently.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeletePost(post.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No matches found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="comments">
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50/50">
                  <TableHead>Comment Content</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Parent Post</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commentsLoading ? (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading comments...</TableCell></TableRow>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell className="max-w-xs"><div className="text-sm line-clamp-2">{comment.content}</div></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{comment.author.full_name}</span>
                          {comment.author.role === 'admin' && <Badge className="text-[10px] h-4 px-1">Admin</Badge>}
                        </div>
                      </TableCell>
                      <TableCell><div className="text-xs text-muted-foreground truncate w-32">{comment.post?.title}</div></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(comment.created_at), 'MMM dd, HH:mm')}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Comment?</AlertDialogTitle>
                              <AlertDialogDescription>This comment will be permanently removed from the discussion.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteComment(comment.id)} className="bg-destructive text-destructive-foreground">Remove</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No recent comments.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
