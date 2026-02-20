'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, LogIn } from "lucide-react";
import { useState } from "react";
import { useForum } from "@/hooks/useForum";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

export function CreatePostModal({ onCreate }: { onCreate: (post: any) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [content, setContent] = useState("");
  
  const { isAuthenticated, user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      author: { 
        name: user?.full_name || "You", 
        role: user?.role || "student" 
      },
      title,
      category,
      content,
    });
    setOpen(false);
    setTitle("");
    setContent("");
    setCategory("General");
  };

  // If user is not authenticated, show a login prompt
  if (!isAuthenticated) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button className="gap-2 rounded-full shadow-lg">
            <PlusCircle className="h-4 w-4" /> New Discussion
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px] bg-white text-foreground border-zinc-200">
          <DialogHeader>
            <DialogTitle>Join the Community</DialogTitle>
            <DialogDescription>
              You need to be logged in to start a discussion.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Create an account or log in to participate in the community forum.
            </p>
            <div className="flex gap-3">
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <LogIn className="h-4 w-4" /> Log In
                </Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button className="w-full">Sign Up</Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-full shadow-lg">
          <PlusCircle className="h-4 w-4" /> New Discussion
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white text-foreground border-zinc-200">
        <DialogHeader>
          <DialogTitle>Start a Discussion</DialogTitle>
          <DialogDescription>
            Share an idea, ask a question, or report a tip to the community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-foreground">Title</Label>
            <Input
              id="title"
              placeholder="What's on your mind?"
              className="col-span-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category" className="text-foreground">Category</Label>
            <select
              id="category"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="General">General</option>
              <option value="Suggestions">Suggestions</option>
              <option value="Lost & Found">Lost & Found</option>
              <option value="Announcements">Announcements</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content" className="text-foreground">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your post here..."
              className="col-span-3 min-h-[120px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Post to Forum</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
