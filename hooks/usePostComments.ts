
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
  created_at: string;
}

export function usePostComments(postId: string) {
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchComments = async () => {
    if (fetched && comments.length > 0) return; // Don't refetch if already have data? Or maybe force refresh?
    
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
      
      // We might need to map the author if the API returns it differently, 
      // but based on route.ts it returns author:profiles(...) which is correct.
      
      setComments([...comments, newComment]);
      toast.success("Comment added!");
      return true;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
      return false;
    }
  };

  return { comments, loading, fetchComments, addComment };
}
