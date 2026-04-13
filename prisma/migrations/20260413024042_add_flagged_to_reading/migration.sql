-- AlterTable
ALTER TABLE "Reading" ADD COLUMN     "flagReason" TEXT,
ADD COLUMN     "isFlagged" BOOLEAN NOT NULL DEFAULT false;
