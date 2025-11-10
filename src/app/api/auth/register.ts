"use server";
import { prisma } from "@/lib/prisma";

export async function registerStudent(name: string, email: string) {
    
    const existingUser = await prisma.students.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const newUser = await prisma.students.create({
        data: { name, email, type: "STUDENT" , isVerified: false, verificationToken: ""},
    });

    return { id: newUser.id, email: newUser.email, name: newUser.name };
}