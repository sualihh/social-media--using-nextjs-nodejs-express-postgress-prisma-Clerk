"use client";

import { createComment, deletePost, getPosts, toggleLike } from "@/action/post.action";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "./ui/card";
import Link from "next/dist/client/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { DeleteAlertDialog } from "./DeleteAlertDialog";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { HeartIcon, LogInIcon, MessageCircleIcon, SendIcon } from "lucide-react";

type Posts = Awaited<ReturnType<typeof getPosts>>
type Post = Posts[number]

 function PostCard({post, dbUserId} : {post: Post, dbUserId: string | null}) {

    const {user} = useUser()
    const [newComment, setNewComment] = useState("")
    const [isCommenting, setIsCommenting] = useState(false)
    const [isLiking, setIsLiking] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [hasLiked, setHasLiked] = useState(post.likes.some((like) => like.userID === dbUserId))
    const [optmisticLikes, setOptmisticLikes] = useState(post._count.likes)
    const [showComments, setShowComments] = useState(false)


    const handleLike = async () => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      setHasLiked((prev) => !prev);
      setOptmisticLikes((prev) => prev + (hasLiked ? -1 : 1));
      await toggleLike(post.id);
    } catch (error) {
      setOptmisticLikes(post._count.likes);
      setHasLiked(post.likes.some((like) => like.userID === dbUserId));
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;
    try {
      setIsCommenting(true);
      const result = await createComment(post.id, newComment);
      if (result?.success) {
        toast.success("Comment posted successfully");
        setNewComment("");
      }
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeletePost = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const result = await deletePost(post.id);
      if (result.success) toast.success("Post deleted successfully");
      else throw new Error(result.error);
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };


  

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        
      </CardContent>
    </Card>
  )
}

export default PostCard