/*
  Warnings:

  - Added the required column `studentName` to the `Appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherName` to the `Appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointments" ADD COLUMN     "studentName" TEXT NOT NULL,
ADD COLUMN     "teacherName" TEXT NOT NULL;
