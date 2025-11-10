/*
  Warnings:

  - Added the required column `verificationToken` to the `Students` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Students" ADD COLUMN     "verificationToken" TEXT NOT NULL;
