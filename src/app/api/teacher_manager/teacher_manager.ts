"use server";
import { prisma } from "@/lib/prisma";

export const addTeacher = async(data : {
    name: string,
    email: string,
    subjects: string[],
    department: string
})=>{
    try {
        const addedTeacher = await prisma.teachers.create({
            data:{
                name: data.name,
                email: data.email,
                subjects: data.subjects,
                department: data.department,
                isVerified: true,
                type: "TEACHER",
                verificationToken: ''
            }
        });
        return addedTeacher;
    }catch(err){
        console.error("Cannot Create Teacher ", err);
        return null;
    }
}

export const fetchAllTeachers = async() =>{
    try{
        const teachers = await prisma.teachers.findMany();
        return teachers;
    }catch(err){
        console.error("Failed Fetching Teachers: ", err);
        return null;
    }
}