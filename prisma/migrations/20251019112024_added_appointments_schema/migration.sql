-- CreateTable
CREATE TABLE "Appointments" (
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Appointments_teacherId_key" ON "Appointments"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointments_studentId_key" ON "Appointments"("studentId");

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
