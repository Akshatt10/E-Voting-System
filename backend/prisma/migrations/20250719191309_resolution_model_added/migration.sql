/*
  Warnings:

  - You are about to drop the column `description` on the `Election` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Election" DROP COLUMN "description";

-- CreateTable
CREATE TABLE "Resolution" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "agreeLabel" TEXT NOT NULL DEFAULT 'Agree',
    "disagreeLabel" TEXT NOT NULL DEFAULT 'Disagree',
    "abstainLabel" TEXT NOT NULL DEFAULT 'Abstain from voting',
    "electionId" TEXT NOT NULL,

    CONSTRAINT "Resolution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Resolution" ADD CONSTRAINT "Resolution_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;
