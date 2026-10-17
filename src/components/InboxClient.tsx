"use client";

import {
  getInboxData,
  getConversationMessages,
  sendMessage,
  startConversation,
} from "@/action/inbox.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, LoaderCircle, MessageCircle, Search, Send } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

type InboxData = Awaited<ReturnType<typeof getInboxData>>;
type Contact = InboxData["contacts"][number];
type Conversation = InboxData["conversations"][number];
type Message = Awaited<ReturnType<typeof getConversationMessages>>[number];

export default function InboxClient({
  initialData,
  initialRecipientId,
}: {
  initialData: InboxData;
  initialRecipientId: string | null;
}) {
  const [contacts, setContacts] = useState(initialData.contacts);
  const [conversations, setConversations] = useState(initialData.conversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialData.conversations[0]?.id ?? null,
  );
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handledRecipientId = useRef<string | null>(null);

  useEffect(() => {
    setConversations(initialData.conversations);
  }, [initialData.conversations]);

  const contactById = useMemo(
    () => new Map(contacts.map((contact) => [contact.id, contact])),
    [contacts],
  );
  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
  );
  const activeContact =
    activeConversation
      ? activeConversation.userOneID === initialData.currentUserId
        ? activeConversation.userTwo
        : activeConversation.userOne
      : activeContactId
        ? contactById.get(activeContactId)
        : null;

  const orderedContacts = useMemo(() => {
    const conversationPosition = new Map(
      conversations.map((conversation, index) => {
        const peerId =
          conversation.userOneID === initialData.currentUserId
            ? conversation.userTwoID
            : conversation.userOneID;
        return [peerId, index];
      }),
    );
    return contacts
      .filter((contact) => {
        const query = search.trim().toLowerCase();
        return (
          !query ||
          contact.name?.toLowerCase().includes(query) ||
          contact.username?.toLowerCase().includes(query)
        );
      })
      .sort((left, right) => {
        const leftPosition = conversationPosition.get(left.id);
        const rightPosition = conversationPosition.get(right.id);
        if (leftPosition !== undefined || rightPosition !== undefined) {
          return (leftPosition ?? Number.MAX_SAFE_INTEGER) -
            (rightPosition ?? Number.MAX_SAFE_INTEGER);
        }
        return (left.name ?? "").localeCompare(right.name ?? "");
      });
  }, [conversations, contacts, initialData.currentUserId, search]);

  useEffect(() => {
    let isActive = true;
    const refreshInbox = async () => {
      try {
        const updatedInbox = await getInboxData();
        if (isActive && updatedInbox.currentUserId) {
          setContacts(updatedInbox.contacts);
          setConversations(updatedInbox.conversations);
        }
      } catch (error) {
        console.error("Could not refresh the inbox:", error);
      }
    };

    const interval = window.setInterval(() => void refreshInbox(), 8000);
    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    let isActive = true;
    const loadMessages = async (showLoading: boolean) => {
      if (showLoading) setIsLoadingMessages(true);
      try {
        const loadedMessages = await getConversationMessages(activeConversationId);
        if (isActive) setMessages(loadedMessages);
      } catch {
        if (isActive && showLoading) toast.error("Could not load this conversation.");
      } finally {
        if (isActive && showLoading) setIsLoadingMessages(false);
      }
    };

    void loadMessages(true);
    const interval = window.setInterval(() => void loadMessages(false), 5000);
    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const selectContact = useCallback(async (contact: Contact) => {
    const existingConversation = conversations.find(
      (conversation) =>
        conversation.userOneID === contact.id || conversation.userTwoID === contact.id,
    );
    setActiveContactId(contact.id);
    if (existingConversation) {
      setActiveConversationId(existingConversation.id);
      return;
    }

    const result = await startConversation(contact.id);
    if (!result.success || !result.conversation) {
      toast.error(result.error ?? "Could not open this conversation.");
      return;
    }
    setConversations((current) => [
      result.conversation,
      ...current.filter((conversation) => conversation.id !== result.conversation.id),
    ]);
    setActiveConversationId(result.conversation.id);
  }, [conversations]);

  useEffect(() => {
    if (
      !initialRecipientId ||
      !initialData.currentUserId ||
      handledRecipientId.current === initialRecipientId
    ) {
      return;
    }
    const recipient = contacts.find((contact) => contact.id === initialRecipientId);
    if (!recipient) return;
    handledRecipientId.current = initialRecipientId;
    void selectContact(recipient);
  }, [contacts, initialData.currentUserId, initialRecipientId, selectContact]);

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeConversationId || !draft.trim() || isSending) return;

    setIsSending(true);
    try {
      const result = await sendMessage(activeConversationId, draft);
      if (!result.success || !result.message) {
        toast.error(result.error ?? "Could not send your message.");
        return;
      }

      const sentMessage = result.message;
      setMessages((current) => [...current, sentMessage]);
      setConversations((current) =>
        current
          .map((conversation) =>
            conversation.id === activeConversationId
              ? {
                  ...conversation,
                  updatedAt: sentMessage.createdAt,
                  messages: [
                    {
                      content: sentMessage.content,
                      createdAt: sentMessage.createdAt,
                      senderID: sentMessage.senderID,
                    },
                  ],
                }
              : conversation,
          )
          .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime()),
      );
      setDraft("");
    } catch {
      toast.error("Could not send your message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="grid h-[clamp(360px,65vh,620px)] min-h-0 grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)]">
        <aside
          className={`min-h-0 border-b bg-white/70 md:border-b-0 md:border-r ${
            activeConversationId ? "hidden md:flex" : "flex"
          } flex-col`}
        >
          <div className="border-b px-5 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                  Your space
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight">Messages</h1>
              </div>
              <span className="rounded-full bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
                {initialData.contacts.length} people
              </span>
            </div>
            <label className="relative mt-5 block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Find someone"
                className="h-10 rounded-xl border-0 bg-muted/70 pl-9 shadow-none focus-visible:ring-1"
              />
            </label>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {orderedContacts.length ? (
              orderedContacts.map((contact) => {
                const conversation = conversations.find(
                  (item) => item.userOneID === contact.id || item.userTwoID === contact.id,
                );
                const isActive = activeContact?.id === contact.id;
                const latestMessage = conversation?.messages[0];

                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => void selectContact(contact)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted/70"
                    }`}
                  >
                    <Avatar className="size-11 shrink-0">
                      <AvatarImage src={contact.image ?? "/avatar.png"} alt="" />
                      <AvatarFallback>{contact.name?.slice(0, 1) ?? "H"}</AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold">
                          {contact.name ?? contact.username}
                        </span>
                        {latestMessage && (
                          <span
                            className={`shrink-0 text-[10px] ${
                              isActive ? "text-primary-foreground/65" : "text-muted-foreground"
                            }`}
                          >
                            {formatDistanceToNow(new Date(latestMessage.createdAt), {
                              addSuffix: false,
                            })}
                          </span>
                        )}
                      </span>
                      <span
                        className={`mt-0.5 block truncate text-xs ${
                          isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {latestMessage?.content ?? `@${contact.username} · Say hello`}
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No people match that search.
              </p>
            )}
          </div>
          <div className="border-t px-5 py-3">
            <Link href="/" className="text-xs font-medium text-muted-foreground hover:text-primary">
              Back to your feed
            </Link>
          </div>
        </aside>

        <div className={`${activeConversationId ? "flex" : "hidden md:flex"} min-h-0 min-w-0 flex-col`}>
          {activeContact ? (
            <>
              <header className="flex h-[76px] items-center gap-3 border-b px-4 sm:px-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => {
                    setActiveConversationId(null);
                    setActiveContactId(null);
                  }}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <Avatar className="size-10">
                  <AvatarImage src={activeContact.image ?? "/avatar.png"} alt="" />
                  <AvatarFallback>{activeContact.name?.slice(0, 1) ?? "H"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{activeContact.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    @{activeContact.username}
                  </p>
                </div>
                <Link
                  href={`/profile/${activeContact.username}`}
                  className="hidden text-xs font-medium text-primary hover:underline sm:block"
                >
                  View profile
                </Link>
              </header>

              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.025] via-background to-background px-4 py-6 sm:px-7">
                {!isLoadingMessages && messages.length === 0 && (
                  <div className="mb-7 text-center">
                    <p className="text-xs font-medium text-muted-foreground">
                      This is the beginning of your conversation with {activeContact.name}.
                    </p>
                  </div>
                )}
                {isLoadingMessages ? (
                  <div className="flex flex-1 items-center justify-center">
                    <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length ? (
                  <div className="mt-auto space-y-3">
                    {messages.map((message) => {
                      const isOwnMessage = message.senderID === initialData.currentUserId;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[82%] rounded-2xl px-4 py-2.5 sm:max-w-[72%] ${
                              isOwnMessage
                                ? "rounded-br-md bg-primary text-primary-foreground"
                                : "rounded-bl-md border bg-card shadow-sm"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                              {message.content}
                            </p>
                            <p
                              className={`mt-1 text-[10px] ${
                                isOwnMessage
                                  ? "text-primary-foreground/65"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatDistanceToNow(new Date(message.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <div className="mb-3 rounded-2xl bg-primary/5 p-4 text-primary">
                      <MessageCircle className="size-6" />
                    </div>
                    <p className="text-sm font-medium">A good conversation starts here.</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Send {activeContact.name} a message to say hello.
                    </p>
                  </div>
                )}
              </div>

              <form onSubmit={handleSend} className="border-t bg-card p-3 sm:p-5">
                <div className="flex items-end gap-2 rounded-2xl border bg-background p-2 pl-4 shadow-sm focus-within:ring-2 focus-within:ring-ring/20">
                  <Textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                    placeholder="Write a message..."
                    aria-label={`Write a message to ${activeContact.name}`}
                    maxLength={2000}
                    rows={2}
                    className="max-h-32 min-h-12 resize-none border-0 bg-transparent px-0 py-2.5 text-sm shadow-none placeholder:text-muted-foreground/80 focus-visible:ring-0"
                    disabled={isSending}
                  />
                  <Button
                    type="submit"
                    className="h-10 shrink-0 gap-2 rounded-xl px-4"
                    disabled={!draft.trim() || isSending}
                  >
                    {isSending ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    <span>{isSending ? "Sending..." : "Send"}</span>
                  </Button>
                </div>
                <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-muted-foreground">
                  <span>Press Enter to send · Shift + Enter for a new line</span>
                  {draft.length > 1800 && (
                    <span aria-live="polite">{draft.length}/2000</span>
                  )}
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="mb-5 rounded-3xl bg-primary/5 p-5 text-primary">
                <MessageCircle className="size-8" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight">A little closer, one message at a time.</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Choose someone from your community to start a private conversation.
              </p>
              <Button
                className="mt-5 rounded-xl md:hidden"
                variant="outline"
                onClick={() => setActiveContactId(null)}
              >
                Browse people
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
