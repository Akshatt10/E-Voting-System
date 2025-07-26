/*
  Warnings:

  - You are about to drop the column `description` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `electionId` on the `Vote` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Vote` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[candidateId,resolutionId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `choice` to the `Vote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resolutionId` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VoteChoice" AS ENUM ('ACCEPT', 'REJECT', 'ABSTAIN');

-- DropForeignKey
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_electionId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_electionId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_userId_fkey";

-- DropIndex
DROP INDEX "Vote_userId_electionId_key";

-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "electionId",
DROP COLUMN "userId",
ADD COLUMN     "choice" "VoteChoice" NOT NULL,
ADD COLUMN     "resolutionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vote_candidateId_resolutionId_key" ON "Vote"("candidateId", "resolutionId");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_resolutionId_fkey" FOREIGN KEY ("resolutionId") REFERENCES "Resolution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
