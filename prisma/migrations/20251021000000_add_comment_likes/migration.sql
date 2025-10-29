-- CreateTable
CREATE TABLE IF NOT EXISTS "comment_likes" (
    "id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "comment_likes_comment_id_user_id_key" ON "comment_likes"("comment_id", "user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "comment_likes_comment_id_idx" ON "comment_likes"("comment_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "comment_likes_user_id_idx" ON "comment_likes"("user_id");

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'comment_likes_comment_id_fkey'
    ) THEN
        ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'comment_likes_user_id_fkey'
    ) THEN
        ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AlterTable (add comment_id to notifications if not exists)
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "comment_id" TEXT;

-- AddForeignKey for notifications
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'notifications_comment_id_fkey'
    ) THEN
        ALTER TABLE "notifications" ADD CONSTRAINT "notifications_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
