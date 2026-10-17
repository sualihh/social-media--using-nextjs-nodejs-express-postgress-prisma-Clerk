"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma";

const personSelection = {
  id: true,
  name: true,
  username: true,
  image: true,
} as const;

export async function getInboxData() {
  let userId: string | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      userId = await getDbUserId();
      if (!userId) return { currentUserId: null, contacts: [], conversations: [] };

      const [contacts, conversations] = await Promise.all([
        prisma.user.findMany({
          where: { id: { not: userId }, username: { not: null } },
          select: personSelection,
          orderBy: { name: "asc" },
          take: 200,
        }),
        prisma.conversation.findMany({
          where: {
            OR: [{ userOneID: userId }, { userTwoID: userId }],
          },
          include: {
            userOne: { select: personSelection },
            userTwo: { select: personSelection },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { content: true, createdAt: true, senderID: true },
            },
          },
          orderBy: { updatedAt: "desc" },
        }),
      ]);

      return { currentUserId: userId, contacts, conversations };
    } catch (error) {
      const isDatabaseUnavailable =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P1001";
      if (isDatabaseUnavailable && attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        continue;
      }

      console.error("Failed to load inbox:", error);
      const missingInboxTable =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2021";

      return {
        currentUserId: userId,
        contacts: [],
        conversations: [],
        error: missingInboxTable
          ? "Inbox storage is not set up yet. Run “npm run db:push”, then refresh."
          : "Hulux couldn’t reach the database. Please try again in a moment.",
      };
    }
  }

  return {
    currentUserId: userId,
    contacts: [],
    conversations: [],
    error: "Hulux couldn’t reach the database. Please try again in a moment.",
  };
}

export async function startConversation(recipientId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("Unauthorized");
    if (recipientId === userId) throw new Error("You cannot message yourself");

    const recipientExists = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true },
    });
    if (!recipientExists) throw new Error("Recipient not found");

    const [userOneID, userTwoID] = [userId, recipientId].sort();
    const conversation = await prisma.conversation.upsert({
      where: { userOneID_userTwoID: { userOneID, userTwoID } },
      create: { userOneID, userTwoID },
      update: {},
      include: {
        userOne: { select: personSelection },
        userTwo: { select: personSelection },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, createdAt: true, senderID: true },
        },
      },
    });

    revalidatePath("/inbox");
    return { success: true, conversation };
  } catch (error) {
    console.error("Failed to start conversation:", error);
    return { success: false, error: "Failed to start conversation" };
  }
}

export async function getConversationMessages(conversationId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("Unauthorized");

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { userOneID: true, userTwoID: true },
    });
    if (
      !conversation ||
      (conversation.userOneID !== userId && conversation.userTwoID !== userId)
    ) {
      throw new Error("Conversation not found");
    }

    const messages = await prisma.message.findMany({
      where: { conversationID: conversationId },
      include: { sender: { select: personSelection } },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return messages.reverse();
  } catch (error) {
    console.error("Failed to load conversation messages:", error);
    throw new Error("Failed to load conversation messages");
  }
}

export async function sendMessage(conversationId: string, content: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("Unauthorized");

    const trimmedContent = content.trim();
    if (!trimmedContent || trimmedContent.length > 2000) {
      throw new Error("Message must contain 1 to 2000 characters");
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { userOneID: true, userTwoID: true },
    });
    if (
      !conversation ||
      (conversation.userOneID !== userId && conversation.userTwoID !== userId)
    ) {
      throw new Error("Conversation not found");
    }

    const message = await prisma.$transaction(async (tx) => {
      const createdMessage = await tx.message.create({
        data: {
          conversationID: conversationId,
          senderID: userId,
          content: trimmedContent,
        },
        include: { sender: { select: personSelection } },
      });
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });
      return createdMessage;
    });

    revalidatePath("/inbox");
    return { success: true, message };
  } catch (error) {
    console.error("Failed to send message:", error);
    return { success: false, error: "Failed to send message" };
  }
}
