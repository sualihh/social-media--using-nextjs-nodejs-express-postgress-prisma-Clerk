import { getRandomUser } from "@/action/user.action";
import FollowButton from "@/components/FollowButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowRight, Camera, Music2, Palette, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function HomeRightRail() {
  const [users, authUser] = await Promise.all([getRandomUser(), currentUser()]);

  return (
    <div className="space-y-7">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold tracking-tight text-slate-900">Stories</h2>
          <Link href="/inbox" className="text-[10px] font-medium text-slate-400 hover:text-violet-600">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {users.slice(0, 4).map((person, index) => (
            <Link
              key={person.id}
              href={`/profile/${person.username}`}
              className={`group relative h-[105px] overflow-hidden rounded-xl bg-gradient-to-br ${
                ["from-sky-200 to-indigo-300", "from-rose-200 to-orange-200", "from-amber-100 to-yellow-300", "from-violet-200 to-fuchsia-300"][index]
              }`}
            >
              <span
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{
                  backgroundImage: person.image
                    ? `linear-gradient(to top, rgb(15 23 42 / 55%), transparent 68%), url("${person.image}")`
                    : undefined,
                }}
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
              <span className="absolute left-2 top-2 rounded-full border-2 border-white shadow-md">
                <Avatar className="size-7">
                  <AvatarImage src={person.image ?? "/avatar.png"} alt="" />
                  <AvatarFallback>{person.name?.slice(0, 1)}</AvatarFallback>
                </Avatar>
              </span>
              <span className="absolute inset-x-2 bottom-2 truncate text-[10px] font-semibold text-white">
                {person.name?.split(" ")[0] ?? "Friend"}
              </span>
            </Link>
          ))}
          {users.length === 0 && (
            <>
              <StoryPlaceholder label="Your day" icon={<Camera className="size-4" />} />
              <StoryPlaceholder label="Good things" icon={<Sparkles className="size-4" />} />
            </>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold tracking-tight text-slate-900">Suggestions</h2>
          <Link href="/inbox" aria-label="Find people to message" className="text-slate-400 hover:text-violet-600">
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {users.slice(0, 4).map((person) => (
            <div key={person.id} className="flex items-center gap-2">
              <Link href={`/profile/${person.username}`} className="shrink-0">
                <Avatar className="size-9 ring-2 ring-white">
                  <AvatarImage src={person.image ?? "/avatar.png"} alt="" />
                  <AvatarFallback>{person.name?.slice(0, 1)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/profile/${person.username}`} className="block truncate text-[11px] font-semibold text-slate-800 hover:text-violet-700">
                  {person.name}
                </Link>
                <p className="truncate text-[10px] text-slate-400">@{person.username}</p>
              </div>
              {authUser ? (
                <FollowButton userId={person.id} />
              ) : (
                <Link href={`/profile/${person.username}`} className="rounded-full bg-slate-950 px-2.5 py-1 text-[9px] font-semibold text-white hover:bg-slate-700">
                  View
                </Link>
              )}
            </div>
          ))}
          {users.length === 0 && (
            <p className="rounded-xl bg-slate-50 px-3 py-4 text-xs leading-relaxed text-slate-500">
              New people will appear here when they join the community.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[15px] font-bold tracking-tight text-slate-900">Explore</h2>
        <div className="grid grid-cols-2 gap-2">
          <ExploreTile title="Design" icon={<Palette className="size-4" />} className="bg-[#edf2ff] text-indigo-600" />
          <ExploreTile title="Music" icon={<Music2 className="size-4" />} className="bg-[#ffe9f1] text-pink-600" />
          <ExploreTile title="Photo" icon={<Camera className="size-4" />} className="bg-[#fef4da] text-amber-700" />
          <ExploreTile title="Creators" icon={<Sparkles className="size-4" />} className="bg-[#f0eaff] text-violet-600" />
        </div>
      </section>
    </div>
  );
}

function StoryPlaceholder({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex h-[105px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </div>
  );
}

function ExploreTile({
  title,
  icon,
  className,
}: {
  title: string;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div className={`flex h-[68px] flex-col items-center justify-center gap-1 rounded-xl ${className}`}>
      {icon}
      <span className="text-[10px] font-semibold">{title}</span>
    </div>
  );
}
