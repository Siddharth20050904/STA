/*
  Warnings:

  - You are about to drop the column `approval` on the `Appointments` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('accepted', 'rejected', 'pending');

-- AlterTable
ALTER TABLE "Appointments" DROP COLUMN "approval",
ADD COLUMN     "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'pending';
