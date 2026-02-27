
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

import { useAuth } from '@/app/context/AuthContext';

export function usePostComments(postId: string) {
  const { user } = useAuth();
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

      const newCommentData = await res.json();
      const mappedComment: ForumComment = {
        ...newCommentData,
        likes_count: 0,
        dislikes_count: 0,
        user_vote: null
      };
      setComments([...comments, mappedComment]);
      toast.success("Comment added!");
      return true;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
      return false;
    }
  };

  const voteComment = async (commentId: string, type: 'like' | 'dislike') => {
    if (!user) {
        toast.error("Please sign in to vote on comments");
        return;
    }

    // Optimistic Update
    const oldComments = [...comments];
    setComments(prev => prev.map(c => {
        if (c.id !== commentId) return c;
        
        let newLikes = c.likes_count;
        let newDislikes = c.dislikes_count;
        let newUserVote: 'like' | 'dislike' | null = type;

        if (c.user_vote === type) {
            newUserVote = null;
            if (type === 'like') newLikes = Math.max(0, newLikes - 1);
            else newDislikes = Math.max(0, newDislikes - 1);
        } else {
            if (type === 'like') {
                newLikes++;
                if (c.user_vote === 'dislike') newDislikes = Math.max(0, newDislikes - 1);
            } else {
                newDislikes++;
                if (c.user_vote === 'like') newLikes = Math.max(0, newLikes - 1);
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
      
      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to vote");
      }
      
    } catch (error: any) {
      setComments(oldComments); // Rollback
      toast.error(error.message || "Action failed");
    }
  };

  return { comments, loading, fetchComments, addComment, voteComment };
}
