import { getProfileByUsername, getUserLikedPosts, getUserPosts, isFollowing } from "@/action/profile.action";
import { getDbUserId } from "@/action/user.action";
import { notFound } from "next/navigation";
import ProfilePageClient from "./ProfilePageClient";


export async function generateMetadata({params}: {params: Promise<{username: string}>}) {
  const user = await getProfileByUsername((await params).username)
  
  if (!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
  
} 

async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {

      const user = await getProfileByUsername((await params).username)

    if (!user) notFound();

    const [posts, likedPosts, isCurrentUserFollowing, dbUserId] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
    getDbUserId(),
  ]);
  
  return (
    <ProfilePageClient 
    user={user} posts={posts} dbUserId={dbUserId}
    likedPosts={likedPosts} 
    isFollowing={isCurrentUserFollowing} />
  )
}


export default ProfilePage
