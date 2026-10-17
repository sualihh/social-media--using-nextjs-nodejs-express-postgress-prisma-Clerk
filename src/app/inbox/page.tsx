import { getInboxData } from "@/action/inbox.action";
import InboxClient from "@/components/InboxClient";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { AlertCircle, MessageCircle } from "lucide-react";
import Link from "next/link";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const inbox = await getInboxData();
  const recipientId = (await searchParams).to ?? null;

  if (inbox.error) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center rounded-3xl border bg-card px-8 text-center shadow-sm">
        <div className="mb-5 rounded-2xl bg-amber-500/10 p-4 text-amber-600">
          <AlertCircle className="size-8" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Your inbox needs attention</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{inbox.error}</p>
        <Button className="mt-6 rounded-xl" asChild>
          <Link href="/inbox">Try again</Link>
        </Button>
      </div>
    );
  }

  if (!inbox.currentUserId) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center rounded-3xl border bg-card px-8 text-center shadow-sm">
        <div className="mb-5 rounded-2xl bg-primary/5 p-4 text-primary">
          <MessageCircle className="size-8" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Your conversations, together.</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Sign in to start a private conversation with someone in the Hulux community.
        </p>
        <SignInButton mode="modal">
          <Button className="mt-6 rounded-xl">Sign in to your inbox</Button>
        </SignInButton>
      </div>
    );
  }

  return <InboxClient initialData={inbox} initialRecipientId={recipientId} />;
}
