import { getProfileByUsername } from "@/action/profile.action";


export async function generateMetadata({params}: {params: Promise<{username: string}>}) {
  const user = await getProfileByUsername((await params).username)
  
  if (!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
  
} 

async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {

    const { username } = await params
    console.log("username:", username);
    
  return (
    <div>
      gg
    </div>
  )
}

export default ProfilePage
