CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL,
    "userOneID" TEXT NOT NULL,
    "userTwoID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL,
    "conversationID" TEXT NOT NULL,
    "senderID" TEXT NOT NULL,
    "content" VARCHAR(2000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Conversation_userOneID_userTwoID_key" ON "Conversation"("userOneID", "userTwoID");
CREATE INDEX IF NOT EXISTS "Conversation_userOneID_updatedAt_idx" ON "Conversation"("userOneID", "updatedAt");
CREATE INDEX IF NOT EXISTS "Conversation_userTwoID_updatedAt_idx" ON "Conversation"("userTwoID", "updatedAt");
CREATE INDEX IF NOT EXISTS "Message_conversationID_createdAt_idx" ON "Message"("conversationID", "createdAt");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Conversation_userOneID_fkey') THEN
        ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userOneID_fkey"
            FOREIGN KEY ("userOneID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Conversation_userTwoID_fkey') THEN
        ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userTwoID_fkey"
            FOREIGN KEY ("userTwoID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Message_conversationID_fkey') THEN
        ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationID_fkey"
            FOREIGN KEY ("conversationID") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Message_senderID_fkey') THEN
        ALTER TABLE "Message" ADD CONSTRAINT "Message_senderID_fkey"
            FOREIGN KEY ("senderID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
