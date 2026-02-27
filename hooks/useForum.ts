
import { useState, useEffect } from 'react';
import { toast } from "sonner";

export interface ForumPost {
  id: string;
  author_id: string;
  author: {
    full_name: string;
    role: 'student' | 'admin';
  };
  title: string;
  content: string;
  category: 'General' | 'Suggestions' | 'Lost & Found' | 'Announcements';
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export function useForum() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async (category?: string, search?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== "All") params.append("category", category);
      if (search) params.append("search", search);

      const res = await fetch(`/api/forum?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      
      const data = await res.json();
      
      // Transform data to match UI needs if necessary, though DB returns similar structure
      // Our API returns author object as { full_name, role } inside the post object
      // DB: author: { full_name, role }
      // UI expects: author: { name, role } -- we need to map full_name to name
      
      const mappedPosts = data.map((post: any) => ({
        ...post,
        author: {
            name: post.author?.full_name || 'Unknown',
            role: post.author?.role || 'student',
            ...post.author
        },
        likes: post.likes_count,
        comments: post.comments_count,
        createdAt: post.created_at
      }));

      setPosts(mappedPosts);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load forum posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const createPost = async (newPost: { title: string; content: string; category: string }) => {
    try {
      const res = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to create post");
      }

      const createdPost = await res.json();
      
       // Optimistic update or refetch
      const mappedPost = {
        ...createdPost,
         author: {
            name: createdPost.author?.full_name || 'You', // Since we just created it, likely us
            role: createdPost.author?.role || 'student',
             ...createdPost.author
        },
        likes: 0,
        comments: 0,
        createdAt: createdPost.created_at
      };

      setPosts([mappedPost, ...posts]);
      toast.success("Discussion started successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create post. Are you logged in?");
    }
  };
  
  const likePost = async (postId: string) => {
      // Optimistic UI update could go here
      try {
          const res = await fetch(`/api/forum/${postId}/like`, { method: "POST" });
          if (!res.ok) throw new Error("Failed to like post");
          
          const { liked } = await res.json();
          
          setPosts(posts.map(p => {
              if (p.id === postId) {
                  return {
                      ...p,
                      likes: liked ? (p.likes_count || 0) + 1 : Math.max(0, (p.likes_count || 0) - 1),
                      likes_count: liked ? (p.likes_count || 0) + 1 : Math.max(0, (p.likes_count || 0) - 1)
                  };
              }
              return p;
          }));
          
      } catch (error) {
          toast.error("Action failed. Please login.");
      }
  }

  const deletePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/forum/${postId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
      
      setPosts(posts.filter(p => p.id !== postId));
      toast.success("Post deleted successfully");
      return true;
    } catch (error) {
      toast.error("Failed to delete post");
      return false;
    }
  };

  return { posts, loading, createPost, fetchPosts, likePost, deletePost };
}
