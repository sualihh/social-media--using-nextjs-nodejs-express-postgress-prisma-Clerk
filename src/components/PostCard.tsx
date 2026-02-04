import { getPosts } from "@/action/post.action";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "react-hot-toast";

type Posts = Awaited<ReturnType<typeof getPosts>>
type Post = Posts[number]

async function PostCard({post, dbuserId} : {post: Post, dbuserId: string | null}) {

    const {user} = useUser()
    const [newComment, setNewComment] = useState("")
    const [isCommenting, setIsCommenting] = useState(false)
    const [isLiking, setIsLiking] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [hasLiked, setHasLiked] = useState(false)
    const [optmisticLikes, setOptmisticLikes] = useState(post._count.likes)


    const handleLike = async () => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      setHasLiked((prev) => !prev);
      setOptmisticLikes((prev) => prev + (hasLiked ? -1 : 1));
      await toggleLike(post.id);
    } catch (error) {
      setOptmisticLikes(post._count.likes);
      setHasLiked(post.likes.some((like) => like.userId === dbUserId));
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
    <div>
      post
    </div>
  )
}

export default PostCard