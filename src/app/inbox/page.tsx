import { getInboxData } from "@/action/inbox.action";
import InboxClient from "@/components/InboxClient";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const inbox = await getInboxData();
  const recipientId = (await searchParams).to ?? null;

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
