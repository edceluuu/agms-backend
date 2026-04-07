/*
  Warnings:

  - Made the column `gridName` on table `Plant` required. This step will fail if there are existing NULL values in that column.
  - Made the column `areaName` on table `Plant` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Reading" DROP CONSTRAINT "Reading_plantId_fkey";

-- AlterTable
ALTER TABLE "Plant" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "gridName" SET NOT NULL,
ALTER COLUMN "areaName" SET NOT NULL,
ALTER COLUMN "longitude" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Reading" ADD CONSTRAINT "Reading_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
