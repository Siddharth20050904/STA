"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function registerStudent(name: string, email: string, password: string) {
    try{
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

        return { id: newUser.id, email: newUser.email, name: newUser.name };
    } catch (error) {
        console.error("Error registering user:", error);
        throw new Error("Error registering user");
    }
}
// TODO: Register Teacher

// export async function registerTeacher(data :{
//     name :string,
//     email :string,
//     subjects : string[],
//     department : string
// }) {
    
// }