/*
  Warnings:

  - You are about to drop the column `isActive` on the `Plant` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Reading" DROP CONSTRAINT "Reading_plantId_fkey";

-- AlterTable
ALTER TABLE "Plant" DROP COLUMN "isActive";

-- AddForeignKey
ALTER TABLE "Reading" ADD CONSTRAINT "Reading_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
