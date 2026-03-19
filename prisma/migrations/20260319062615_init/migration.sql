/*
  Warnings:

  - You are about to drop the `Area` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Grid` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GridAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GrowthReading` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Plant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Grid" DROP CONSTRAINT "Grid_areaId_fkey";

-- DropForeignKey
ALTER TABLE "GridAssignment" DROP CONSTRAINT "GridAssignment_gridId_fkey";

-- DropForeignKey
ALTER TABLE "GridAssignment" DROP CONSTRAINT "GridAssignment_userId_fkey";

-- DropForeignKey
ALTER TABLE "GrowthReading" DROP CONSTRAINT "GrowthReading_plantId_fkey";

-- DropForeignKey
ALTER TABLE "GrowthReading" DROP CONSTRAINT "GrowthReading_userId_fkey";

-- DropForeignKey
ALTER TABLE "Plant" DROP CONSTRAINT "Plant_gridId_fkey";

-- DropTable
DROP TABLE "Area";

-- DropTable
DROP TABLE "Grid";

-- DropTable
DROP TABLE "GridAssignment";

-- DropTable
DROP TABLE "GrowthReading";

-- DropTable
DROP TABLE "Plant";
