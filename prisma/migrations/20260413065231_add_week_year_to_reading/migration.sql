/*
  Warnings:

  - Added the required column `weekNumber` to the `Reading` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Reading` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reading" ADD COLUMN     "weekNumber" INTEGER NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;
