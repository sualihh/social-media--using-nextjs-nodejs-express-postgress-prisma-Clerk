"use client";

import { createComment, deleteComment, deletePost, getPosts, toggleLike } from "@/action/post.action";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { DeleteAlertDialog } from "./DeleteAlertDialog";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { HeartIcon, LogInIcon, MessageCircleIcon, SendIcon } from "lucide-react";
import { useRouter } from "next/navigation";

type Posts = Awaited<ReturnType<typeof getPosts>>
type Post = Posts[number]

 function PostCard({
   post,
   dbUserId,
   tone = "white",
 }: {
   post: Post;
   dbUserId: string | null;
   tone?: "white" | "blue" | "cream";
 }) {

    const {user} = useUser()
    const router = useRouter()
    const [newComment, setNewComment] = useState("")
    const [comments, setComments] = useState(post.comments)
    const [isCommenting, setIsCommenting] = useState(false)
    const [isLiking, setIsLiking] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)
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
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (deletingCommentId) return;
    setDeletingCommentId(commentId);
    try {
      const result = await deleteComment(commentId);
      if (!result.success) throw new Error(result.error);
      setComments((current) => current.filter((comment) => comment.id !== commentId));
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    } finally {
      setDeletingCommentId(null);
    }
  };

  
  const handleDeletePost = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const result = await deletePost(post.id);
      if (result.success) {
        toast.success("Post deleted successfully");
        router.refresh();
      }
      else throw new Error(result.error);
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };


  

  return (
    <Card className={`overflow-hidden rounded-[16px] border-0 shadow-none transition-shadow hover:shadow-sm ${
      tone === "blue" ? "bg-[#e9f1ff]" : tone === "cream" ? "bg-[#fff6e2]" : "bg-white"
    }`}>
      <CardContent className="p-4 sm:p-5">
        <div className="space-y-3">
          <div className="flex gap-3">
            <Link href={`/profile/${post.author.username}`}>
              <Avatar className="size-9 shrink-0 ring-2 ring-white/80">
                <AvatarImage src={post.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                  <Link
                    href={`/profile/${post.author.username}`}
                    className="truncate text-[13px] font-bold text-slate-900"
                  >
                    {post.author.name ?? post.author.username}
                  </Link>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Link href={`/profile/${post.author.username}`}>@{post.author.username}</Link>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                  </div>
                </div>
                {/* Check if current user is the post author */}
                {dbUserId === post.author.id && (
                  <DeleteAlertDialog isDeleting={isDeleting} onDelete={handleDeletePost} />
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words text-[12px] leading-[1.65] text-slate-800">{post.content}</p>
            </div>
          </div>

          {/* POST IMAGE */}
          {post.image && (
            <div className="max-h-[420px] overflow-hidden rounded-xl">
              <img src={post.image} alt="Post content" className="max-h-[420px] w-full object-cover" />
            </div>
          )}


          {/* LIKE & COMMENT BUTTONS */}
          <div className="flex items-center gap-1 border-t border-slate-900/5 pt-2">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 gap-1.5 px-2 text-[11px] text-slate-500 ${
                  hasLiked ? "text-rose-500 hover:text-rose-600" : "hover:text-rose-500"
                }`}
                onClick={handleLike}
              >
                {hasLiked ? (
                  <HeartIcon className="size-4 fill-current" />
                ) : (
                  <HeartIcon className="size-4" />
                )}
                <span>{optmisticLikes}</span>
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-[11px] text-slate-500">
                  <HeartIcon className="size-4" />
                  <span>{optmisticLikes}</span>
                </Button>
              </SignInButton>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-[11px] text-slate-500 hover:text-sky-600"
              onClick={() => setShowComments((prev) => !prev)}
            >
              <MessageCircleIcon
                className={`size-4 ${showComments ? "fill-sky-500 text-sky-500" : ""}`}
              />
              <span>{comments.length}</span>
            </Button>
          </div>

          {/* COMMENTS SECTION */}
          {showComments && (
            <div className="space-y-4 border-t border-slate-900/5 pt-4">
              <div className="space-y-3">
                {/* DISPLAY COMMENTS */}
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="size-8 flex-shrink-0">
                      <AvatarImage src={comment.author.image ?? "/avatar.png"} />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-sm">{comment.author.name}</span>
                        <span className="text-sm text-muted-foreground">
                          @{comment.author.username}
                        </span>
                        <span className="text-sm text-muted-foreground">·</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt))} ago
                        </span>
                      </div>
                      <p className="text-sm break-words">{comment.content}</p>
                    </div>
                    {dbUserId === comment.author.id && (
                      <DeleteAlertDialog
                        isDeleting={deletingCommentId === comment.id}
                        onDelete={() => handleDeleteComment(comment.id)}
                        title="Delete comment"
                        description="This comment will be permanently removed."
                      />
                    )}
                  </div>
                ))}
              </div>

              {user ? (
                <div className="flex space-x-3">
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarImage src={user?.imageUrl || "/avatar.png"} />
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        className="flex items-center gap-2"
                        disabled={!newComment.trim() || isCommenting}
                      >
                        {isCommenting ? (
                          "Posting..."
                        ) : (
                          <>
                            <SendIcon className="size-4" />
                            Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center p-4 border rounded-lg bg-muted/50">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="gap-2">
                      <LogInIcon className="size-4" />
                      Sign in to comment
                    </Button>
                  </SignInButton>
                </div>
              )}
            </div>
          )}

          </div>
      </CardContent>
    </Card>
  )
}

export default PostCard