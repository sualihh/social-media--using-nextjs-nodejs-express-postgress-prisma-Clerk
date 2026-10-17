import { getUserByClerkId } from "@/action/user.action";
import { currentUser } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  ChevronRight,
  Compass,
  Download,
  Home,
  Image as ImageIcon,
  Mail,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

const navigation = [
  { label: "News Feed", href: "/", icon: Home, active: true },
  { label: "Messages", href: "/inbox", icon: Mail },
  { label: "Discover", href: "/#discover", icon: Compass },
  { label: "Friends", href: "/#friends", icon: UsersRound },
  { label: "Media", href: "/#media", icon: ImageIcon },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

export default async function Sidebar() {
  const authUser = await currentUser();
  const user = authUser ? await getUserByClerkId(authUser.id) : null;

  return (
    <div className="flex h-full flex-col px-4 py-6">
      {user ? (
        <Link href={`/profile/${user.username}`} className="group mb-6 text-center">
          <div className="relative mx-auto flex w-fit items-center">
            <Avatar className="size-[58px] border-[3px] border-white shadow-sm ring-1 ring-slate-100">
              <AvatarImage src={user.image ?? "/avatar.png"} alt="" />
              <AvatarFallback className="bg-sky-100 font-semibold text-slate-700">
                {user.name?.slice(0, 1) ?? "H"}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -right-7 rounded-full border-[3px] border-white bg-gradient-to-br from-cyan-100 to-violet-100 p-2 text-violet-500 shadow-sm">
              <span className="block size-3 rounded-full bg-gradient-to-br from-sky-400 to-fuchsia-500" />
            </span>
          </div>
          <p className="mt-3 truncate text-sm font-bold text-slate-900 group-hover:text-violet-700">
            {user.name ?? user.username}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-slate-400">@{user.username}</p>
          <div className="mt-4 flex justify-center gap-5">
            <span className="text-center">
              <span className="block text-sm font-bold text-slate-800">{user._count.following}</span>
              <span className="text-[10px] text-slate-400">Following</span>
            </span>
            <span className="h-8 w-px bg-slate-100" />
            <span className="text-center">
              <span className="block text-sm font-bold text-slate-800">{user._count.followers}</span>
              <span className="text-[10px] text-slate-400">Followers</span>
            </span>
          </div>
        </Link>
      ) : (
        <div className="mb-5 rounded-2xl bg-slate-50 p-4 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-white text-violet-500 shadow-sm">
            <UsersRound className="size-5" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">Join the conversation</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">Sign in to share, follow friends, and chat.</p>
          <SignInButton mode="modal">
            <Button size="sm" className="mt-3 h-8 w-full rounded-lg bg-slate-950 text-xs hover:bg-slate-800">
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button type="button" className="mt-2 text-xs font-medium text-violet-600 hover:underline">
              Create an account
            </button>
          </SignUpButton>
        </div>
      )}

      <Separator className="mb-3 bg-slate-100" />
      <nav className="space-y-1" aria-label="Main navigation">
        {navigation.map(({ label, href, icon: Icon, active }) => (
          <Link
            key={label}
            href={href}
            className={`flex items-center gap-3 rounded-xl px-3 py-[11px] text-[12px] font-medium transition-colors ${
              active
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <Icon className="size-4" strokeWidth={1.9} />
            {label}
            {label === "Messages" && user && (
              <span className={`ml-auto flex size-5 items-center justify-center rounded-full text-[10px] ${active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>
                <span className="sr-only">Open inbox</span>
                <ChevronRight aria-hidden="true" className="size-3" />
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-7">
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-[#fbfbfd] p-3 text-center">
          <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 via-white to-cyan-100">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white text-violet-500 shadow-sm">
              <Download className="size-4" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-800">Take Hulux with you</p>
          <p className="mt-1 text-[10px] text-slate-400">Your community, anywhere.</p>
        </div>
        <p className="mt-4 text-center text-[9px] text-slate-300">About · Privacy · Terms · © Hulux</p>
      </div>
    </div>
  );
}
