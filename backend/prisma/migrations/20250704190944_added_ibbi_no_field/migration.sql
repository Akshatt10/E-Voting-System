/*
  Warnings:

  - A unique constraint covering the columns `[IBBI]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "IBBI" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_IBBI_key" ON "User"("IBBI");
