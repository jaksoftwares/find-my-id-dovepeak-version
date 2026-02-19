
import { z } from "zod";

export const forumPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  content: z.string().min(10, "Content must be at least 10 characters").max(1000),
  category: z.enum(["General", "Suggestions", "Lost & Found", "Announcements"]),
});

export const forumCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(500),
});

export type ForumPostData = z.infer<typeof forumPostSchema>;
export type ForumCommentData = z.infer<typeof forumCommentSchema>;
