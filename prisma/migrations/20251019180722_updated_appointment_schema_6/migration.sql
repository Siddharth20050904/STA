-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('completed', 'upcoming', 'cancelled');

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
    "verificationToken" TEXT NOT NULL,

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

-- CreateTable
CREATE TABLE "Appointments" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "approval" BOOLEAN NOT NULL DEFAULT false,
    "status" "MeetingStatus" NOT NULL DEFAULT 'upcoming',
    "message" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Students_email_key" ON "Students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Teachers_email_key" ON "Teachers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admins_email_key" ON "Admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Appointments_teacherId_key" ON "Appointments"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointments_studentId_key" ON "Appointments"("studentId");

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
