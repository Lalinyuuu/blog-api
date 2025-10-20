/*
  Warnings:

  - You are about to drop the `dislikes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "dislikes" DROP CONSTRAINT "dislikes_post_id_fkey";

-- DropForeignKey
ALTER TABLE "dislikes" DROP CONSTRAINT "dislikes_user_id_fkey";

-- DropTable
DROP TABLE "dislikes";
