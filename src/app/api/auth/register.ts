"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendStudentVerificationRequest } from "../handleMails/sendStudentVerificationRequest";

export async function registerStudent(name: string, email: string, password: string) {
    
    const existingUser = await prisma.students.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.students.create({
        data: { name, email, password: hashedPassword, type: "STUDENT" , isVerified: false},
    });

    await sendStudentVerificationRequest(newUser.id);

    return { id: newUser.id, email: newUser.email, name: newUser.name };
}