/*
  Warnings:

  - You are about to drop the `authors` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "bylineAvatar" TEXT,
ADD COLUMN     "bylineName" TEXT;

-- DropTable
DROP TABLE "authors";
