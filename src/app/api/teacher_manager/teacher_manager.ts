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

export const removeTeacher = async(id: string)=>{
    try{
        const removeTeacher = await prisma.teachers.delete({
            where:{id}
        });

        if(!removeTeacher){
            console.log("Teacher doesn't exist!!!")
            return null;
        }

        return removeTeacher;
    }catch(err){
        console.log(err);
        return null;
    }
}

export const updateTeacherFields = async({name, subjects, email, department, id}:{
    name: string,
    subjects: string[],
    email: string,
    department: string,
    id: string
})=>{
    try{
        const updatedTeacher = await prisma.teachers.update({
            where:{id},
            data:{
                name,
                subjects,
                department,
                email,
            }
        });
        
        if(!updatedTeacher){
            console.log("Error in updating teacher");
            return null;
        }

        return updatedTeacher;
    }catch(err){
        console.log(err);
        return null;
    }
}