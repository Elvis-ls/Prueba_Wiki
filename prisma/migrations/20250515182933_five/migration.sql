/*
  Warnings:

  - You are about to drop the column `fullContent` on the `News` table. All the data in the column will be lost.
  - You are about to drop the column `fullImageUrl` on the `News` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "News" DROP COLUMN "fullContent",
DROP COLUMN "fullImageUrl",
ALTER COLUMN "publicationDate" SET DEFAULT CURRENT_TIMESTAMP;
