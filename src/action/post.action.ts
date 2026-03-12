"use server"

import prisma from "@/lib/prisma"
import { getDbUserId } from "./user.action"
import { revalidatePath } from "next/cache"



export async function createPost(content: string, image: string) {
    try {
        const userId = await getDbUserId()
        
        if(!userId) return
        const post = await prisma.post.create({
            data: {
                content,
                image,
                authorID: userId,
            }
        })
        revalidatePath("/")  // revalidate the home page to show the new post
        return {success: true, post }
    } catch (error) {
        console.log("Error creating post ", error);
        return {success: false, error: "Failed to create post"}
    }
}

export async function getPosts() {

    try {
        const posts = await prisma.post.findMany({
            orderBy: {
                createdAt:"desc"
            },
            include:{
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        username: true,
                    }
                },
                comments: {
                    include: {
                        author: {
                            select:{
                                id: true,
                                username: true,
                                image: true,
                                name: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "asc"
                    }
                }, 
                likes: {
                    select:{
                        userID: true
                    }
                },
                _count:{
                    select: {
                        likes: true,
                        comments: true,
                    }
                }
            }
        })
        return posts
    } catch (error) {
        console.log("Error in fetch post", error);
        throw new Error("Failed to feth posts")
        
    }
}

export async function toggleLike(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    // check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        postID_userID: {
          userID: userId,
          postID: postId,
        },
      },
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorID: true },
    });

    if (!post) throw new Error("Post not found");

    if (existingLike) {
      // unlike
      await prisma.like.delete({
        where: {
          postID_userID: {
            userID: userId,
            postID: postId,
          },
        },
      });
    } else {
      // like and create notification (only if liking someone else's post)
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userID: userId,
            postID: postId,
          },
        }),
        ...(post.authorID !== userId
          ? [
              prisma.notification.create({
                data: {
                  type: "LIKE",
                  userID: post.authorID, // recipient (post author)
                  creatorID: userId, // person who liked
                  postID: postId,
                },
              }), 
            ]
          : []),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return { success: false, error: "Failed to toggle like" };
  }
}


export async function createComment(postId: string, content: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;
    if (!content) throw new Error("Content is required");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorID: true },
    });

    if (!post) throw new Error("Post not found");

    // Create comment and notification in a transaction
    const [comment] = await prisma.$transaction(async (tx) => {
      // Create comment first
      const newComment = await tx.comment.create({
        data: {
          content,
          authorID: userId,
          postID: postId,
        },
      });

      // Create notification if commenting on someone else's post
      if (post.authorID !== userId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userID: post.authorID,
            creatorID: userId,
            postID: postId,
            comentID: newComment.id,
          },
        });
      }

      return [newComment];
    });

    revalidatePath(`/`);
    return { success: true, comment };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
}



