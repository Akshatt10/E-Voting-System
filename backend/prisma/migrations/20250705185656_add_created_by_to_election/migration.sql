/*
  Warnings:

  - You are about to drop the column `test` on the `User` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `Election` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "test";

ALTER TABLE "Election" ADD COLUMN "createdById" TEXT;

-- Optional: Fill it with some default user ID for now (e.g. admin user ID)
-- WARNING: Make sure this ID exists in your User table
UPDATE "Election" SET "createdById" = 'cmc3paapx0000ul8kgtr0y7cg';

-- Then make the column NOT NULL
ALTER TABLE "Election" ALTER COLUMN "createdById" SET NOT NULL;

-- (Indexes or constraints may follow depending on your schema)
