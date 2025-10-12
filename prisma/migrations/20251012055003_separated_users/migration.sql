/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "Students" (
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "type" "Role" NOT NULL,
    "password" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teachers" (
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "type" "Role" NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "department" TEXT NOT NULL,
    "subjects" TEXT[],

    CONSTRAINT "Teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admins" (
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "type" "Role" NOT NULL,
    "password" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Students_email_key" ON "Students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Teachers_email_key" ON "Teachers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admins_email_key" ON "Admins"("email");
