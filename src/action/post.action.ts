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