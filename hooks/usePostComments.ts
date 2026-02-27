
import { useState } from 'react';
import { toast } from "sonner";

export interface ForumComment {
  id: string;
  post_id: string;
  author: {
    full_name: string;
    role: 'student' | 'admin';
  };
  content: string;
  likes_count: number;
  dislikes_count: number;
  user_vote: 'like' | 'dislike' | null;
  created_at: string;
}

export function usePostComments(postId: string) {
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/forum/${postId}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      
      const data = await res.json();
      setComments(data);
      setFetched(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string) => {
    try {
      const res = await fetch(`/api/forum/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Please login to comment");
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add comment");
      }

      const newComment = await res.json();
      setComments([...comments, newComment]);
      toast.success("Comment added!");
      return true;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
      return false;
    }
  };

  const voteComment = async (commentId: string, type: 'like' | 'dislike') => {
    // Optimistic Update
    const oldComments = [...comments];
    setComments(prev => prev.map(c => {
        if (c.id !== commentId) return c;
        
        let newLikes = c.likes_count;
        let newDislikes = c.dislikes_count;
        let newUserVote: 'like' | 'dislike' | null = type;

        if (c.user_vote === type) {
            newUserVote = null;
            if (type === 'like') newLikes--;
            else newDislikes--;
        } else {
            if (type === 'like') {
                newLikes++;
                if (c.user_vote === 'dislike') newDislikes--;
            } else {
                newDislikes++;
                if (c.user_vote === 'like') newLikes--;
            }
        }

        return { ...c, likes_count: newLikes, dislikes_count: newDislikes, user_vote: newUserVote };
    }));

    try {
      const res = await fetch(`/api/forum/comments/${commentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) throw new Error("Failed to vote on comment");
      
    } catch (error) {
      setComments(oldComments); // Rollback
      toast.error("Action failed. Please login.");
    }
  };

  return { comments, loading, fetchComments, addComment, voteComment };
}
