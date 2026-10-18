import { getPosts } from "@/action/post.action";
import { getDbUserId } from "@/action/user.action";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import Sidebar from "@/components/Sidebar";
import HomeRightRail from "@/components/HomeRightRail";
import { currentUser } from "@clerk/nextjs/server";


export default async function Home() {
  const [user, posts, dbUserId] = await Promise.all([
    currentUser(),
    getPosts(),
    getDbUserId(),
  ]);
  
  return (
    <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-[1360px] grid-cols-1 overflow-hidden rounded-[26px] border border-border bg-card text-card-foreground shadow-[0_20px_70px_-45px_rgba(30,36,62,0.34)] lg:grid-cols-[190px_minmax(0,1fr)_190px] 2xl:grid-cols-[220px_minmax(0,1fr)_230px]">
      <aside className="hidden border-r border-border bg-card lg:block">
        <Sidebar />
      </aside>

      <section className="min-w-0 px-4 py-6 sm:px-7 lg:px-6 xl:px-8">
        <header className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-500">YOUR COMMUNITY</p>
            <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-tight text-foreground">News feed</h1>
          </div>
          <div className="hidden items-center gap-4 text-xs font-medium text-muted-foreground sm:flex" aria-label="Feed view">
            <span>Recents</span>
            <span className="text-foreground">Friends</span>
            <span>Popular</span>
          </div>
        </header>
        {user && <CreatePost />}
        <div className="space-y-4">
          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              dbUserId={dbUserId}
              tone={index % 2 === 0 ? "blue" : "cream"}
            />
          ))}
          {posts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
              <p className="text-base font-semibold text-foreground">Your feed is ready for a first post.</p>
              <p className="mt-2 text-sm text-muted-foreground">Share something with your community to get started.</p>
            </div>
          )}
        </div>
      </section>

      <aside className="hidden border-l border-border bg-card px-3 py-6 lg:block 2xl:px-4">
        <HomeRightRail />
      </aside>
    </div>
  );
}
