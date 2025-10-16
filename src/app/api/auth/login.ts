"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcrypt';
import { error } from "console";
// import { sendVerificationLink } from "../handleMails/sendVerificationMail";
import { verifyToken } from "@/lib/jwt";

export const loginStudent = async(data :{ email: string, password: string })=>{
    const user = await prisma.students.findUnique({
        where:{
            email: data.email
        }
    });

    if(!user) throw error("USER NOT FOUND!!!")

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if(!isPasswordValid) throw error("INVALID PASSWORD!!!!");

    return user;
}

export const loginAdmin = async(data :{ email: string, password: string })=>{
    console.log(data);
    const user = await prisma.admins.findUnique({
        where:{
            email: data.email
        }
    });

    if(!user) {
        console.error("USER NOT FOUND !!!!");
        return
    }

    console.log(user);

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if(!isPasswordValid) return null;

    return user;
}

export const loginTeacher = async(token: string)=>{
    const payLoad = verifyToken(token);
    if(!payLoad) return null;
    const {userId, email, role} = payLoad;

    const teacher = await prisma.teachers.findUnique({
        where:{
            id: userId,
            email,
            type: role
        }
    });

    return teacher;
}