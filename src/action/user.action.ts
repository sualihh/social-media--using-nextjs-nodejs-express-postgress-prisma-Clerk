"use server"

import prisma from "@/lib/prisma"
import { auth, currentUser } from "@clerk/nextjs/server"
import { log } from "console"
import { revalidatePath } from "next/cache"

export async function syncUser() {

    try {
        const {userId} = await auth()
        const user = await currentUser()
        if (!userId || !user) return

        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId: userId
            }
        })  
        if (existingUser) return existingUser

        const dbUser = await prisma.user.create({
            data: {
                clerkId: userId,
                name:`${user.firstName || ''} ${user.lastName || ''}`.trim(),
                username: user.username ?? user.emailAddresses[0]?.emailAddress?.split('@')[0],
                email: user.emailAddresses[0]?.emailAddress || '',
                image: user.imageUrl,
                
            }
        })

        return dbUser
    } catch (error) {
        console.log("Error in console ", error);
        
    }
}

export async function getUserByClerkId(clerkId: string) {
    const user = await prisma.user.findUnique({
        where: {
            clerkId,
        },
        include: {
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        posts: true,
                    }
                }
        }
    })
    return user
}

export async function getDbUserId() {
    const {userId:clerkId} = await auth() 
    if (!clerkId) return null

        const user= await getUserByClerkId(clerkId)
        if (!user) throw new Error("User not found in database")
            console.log("user.id:", user.id);
            
        return user.id
}

export async function getRandomUser() {
    
    try {
        const userId = await getDbUserId();

        const randomUsers = await prisma.user.findMany({
            where: userId
                ? {
                    AND: [
                        { NOT: { id: userId } },
                        {
                            NOT: {
                                followers: {
                                    some: {
                                        followerID: userId
                                    }
                                }
                            }
                        }
                    ]
                }
                : { username: { not: null } },
            select: {
                id: true,
                name: true,
                username: true, 
                image: true,
                _count: {
                    select: {
                        followers: true,
                    },
                }
            },  
            take: 8,
        })   


    return randomUsers
    } catch (error) {
        console.log("Error in getRandomUser:", error);  
        return []
    }
}

 export async function toogleFollow(targetUserId:string) {
    try {
        const userId = await getDbUserId()
        if(!userId) return;
        
        if(userId === targetUserId ) throw new Error("You cannot follow yourself")

            const existingFolow = await prisma.follows.findUnique({
                where:{
                    followerID_followingID: {
                        followerID: userId,
                        followingID: targetUserId, 
                    }
                }
            })

            if (existingFolow) {
                //unfollow
                await prisma.follows.delete({
                where:{
                    followerID_followingID: {
                        followerID: userId,
                        followingID: targetUserId, 
                    }
                }
            })

            } else {
                //  follow by transaction
                await prisma.$transaction([
                    prisma.follows.create({
                        data: { 
                            followerID: userId,
                            followingID: targetUserId,
                         }
                    }),
                    prisma.notification.create({
                        data: {
                            userID: targetUserId,
                            type: "FOLLOW",
                            creatorID: userId,
                        }
                    })
                ])  
            }
            revalidatePath("/")
            return {success: true}
    } catch (error) {
        console.log("Error in toogleFollow:", error);
        return {success: false, error: "Error toggling follow status"
    }
 }
}