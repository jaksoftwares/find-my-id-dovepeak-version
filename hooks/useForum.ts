
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
  category: 'General' | 'Suggestions' | 'Lost & Found' | 'Announcements' | 'Member Thoughts';
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  user_vote: 'like' | 'dislike' | null;
  created_at: string;
}

export function useForum() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentParams, setCurrentParams] = useState({ category: 'All', search: '' });

  const fetchPosts = async (category?: string, search?: string) => {
    const activeCategory = category ?? currentParams.category;
    const activeSearch = search ?? currentParams.search;
    
    if (category !== undefined || search !== undefined) {
        setCurrentParams({ category: activeCategory, search: activeSearch });
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory && activeCategory !== "All") params.append("category", activeCategory);
      if (activeSearch) params.append("search", activeSearch);

      const res = await fetch(`/api/forum?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      
      const data = await res.json();
      
      const mappedPosts = data.map((post: any) => ({
        ...post,
        author: {
            name: post.author?.full_name || 'Unknown',
            role: post.author?.role || 'student',
            ...post.author
        },
        likes: post.likes_count,
        dislikes: post.dislikes_count,
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
      
      const mappedPost = {
        ...createdPost,
         author: {
            name: createdPost.author?.full_name || 'You',
            role: createdPost.author?.role || 'student',
             ...createdPost.author
        },
        likes: 0,
        comments: 0,
        createdAt: createdPost.created_at,
        user_vote: null
      };

      setPosts([mappedPost, ...posts]);
      toast.success("Posted successfully!");
      return true;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create post. Are you logged in?");
      return false;
    }
  };
  
  const likePost = async (postId: string, type: 'like' | 'dislike' = 'like') => {
      // Optimistic Update
      const oldPosts = [...posts];
      setPosts(prev => prev.map(p => {
          if (p.id !== postId) return p;
          
          let newLikes = p.likes_count;
          let newDislikes = p.dislikes_count;
          let newUserVote: 'like' | 'dislike' | null = type;

          if (p.user_vote === type) {
              // Toggling off
              newUserVote = null;
              if (type === 'like') newLikes--;
              else newDislikes--;
          } else {
              // New vote or switching
              if (type === 'like') {
                  newLikes++;
                  if (p.user_vote === 'dislike') newDislikes--;
              } else {
                  newDislikes++;
                  if (p.user_vote === 'like') newLikes--;
              }
          }

          return { ...p, likes_count: newLikes, dislikes_count: newDislikes, user_vote: newUserVote };
      }));

      try {
          const res = await fetch(`/api/forum/${postId}/like`, { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type })
          });
          if (!res.ok) throw new Error("Failed to vote on post");
          
          // No need to refetch if optimistic set was successful, 
          // but we can refetch to be safe or sync with server state
          // fetchPosts(); 
          
      } catch (error) {
          setPosts(oldPosts); // Rollback
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
