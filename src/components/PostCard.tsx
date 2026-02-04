import { getPosts } from "@/action/post.action";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

type Posts = ReturnType<typeof getPosts>

async function PostCard({post, dbuserId} : {post: Post, dbuserId: string | null}) {

    const {user} = useUser()
    const [newComment, setNewComment] = useState("")
    const [isCommenting, setIsCommenting] = useState(false)
    const [isLiking, setIsLiking] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [hasLiked, setHasLiked] = useState(false)
    const [likes, setLikes] = useState(post._count.likes)

  return (
    <div>
      post
    </div>
  )
}

export default PostCard