import { ForumPost } from "@/hooks/useForum";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, Share2, MoreHorizontal, Send, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { usePostComments } from "@/hooks/usePostComments";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";

interface ForumPostCardProps {
  post: ForumPost;
  onLike?: () => void;
  onDelete?: () => void;
}

export function ForumPostCard({ post, onLike, onDelete }: ForumPostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const { comments, loading, fetchComments, addComment } = usePostComments(post.id);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isOwner = user?.id === post.author_id;

  const toggleComments = () => {
    if (!showComments) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    if (onDelete) {
        onDelete();
        return;
    }
    
    try {
      const res = await fetch(`/api/forum/${post.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
      toast.success("Post deleted");
      window.location.reload(); 
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    const success = await addComment(newComment);
    setSubmitting(false);
    
    if (success) {
      setNewComment("");
    }
  };

  return (
    <Card className="hover:border-primary/50 transition-colors border-zinc-200 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${
            post.author.role === 'admin' ? 'bg-primary' : 'bg-zinc-200 text-zinc-600'
          }`}>
            {post.author.role === 'admin' ? 'A' : post.author.full_name?.charAt(0) || '?'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">{post.author.full_name || 'Unknown User'}</span>
              {post.author.role === 'admin' && (
                <Badge variant="default" className="text-[10px] h-4 px-1">Admin</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        {(isAdmin || isOwner) && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="mb-2">
          <Badge variant="secondary" className="mb-2 text-xs font-normal">
            {post.category}
          </Badge>
          <CardTitle className="text-lg font-bold text-foreground mb-2">
            {post.title}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground leading-relaxed">
            {post.content}
          </CardDescription>
        </div>
        
        <div className="flex items-center gap-4 mt-6 border-t pt-4">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary" onClick={onLike}>
            <ThumbsUp className="h-4 w-4" />
            <span className="text-xs">{post.likes_count}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-muted-foreground hover:text-primary"
            onClick={toggleComments}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs">{post.comments_count} Comments</span>
          </Button>
          <Button variant="ghost" size="sm" className="ml-auto gap-2 text-muted-foreground hover:text-primary">
            <Share2 className="h-4 w-4" />
            <span className="text-xs">Share</span>
          </Button>
        </div>

        {showComments && (
          <div className="mt-4 space-y-4">
            <div className="space-y-3 bg-zinc-50/50 p-4 rounded-lg">
              {loading ? (
                <div className="flex justify-center p-2">
                   <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2 text-sm">
                    <div className={`h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${
                      comment.author.role === 'admin' ? 'bg-primary' : 'bg-zinc-200 text-zinc-600'
                    }`}>
                      {comment.author.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-foreground text-xs">{comment.author.full_name}</span>
                        <span className="text-[10px] text-muted-foreground">
                           {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-300 mt-0.5">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">No comments yet. Be the first!</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
               <Input 
                 placeholder="Write a comment..." 
                 className="h-9 text-sm"
                 value={newComment}
                 onChange={(e) => setNewComment(e.target.value)}
                 disabled={submitting}
               />
               <Button type="submit" size="icon" disabled={submitting || !newComment.trim()} className="h-9 w-9">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
               </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
