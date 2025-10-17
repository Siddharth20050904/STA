"use server";
import { prisma } from '@/lib/prisma';

export const fetchUnverifiedStudents = async()=>{
    const unverifiedStudents = await prisma.students.findMany({
        where:{isVerified:false}
    });

    return unverifiedStudents;
}

export const verifyStudent = async(id: string)=>{
    const verifiedStudent = await prisma.students.update({
        where: {id},
        data:{isVerified: true}
    });

    return verifiedStudent;
}

export const removeStudent = async(id: string)=>{
    const deletedStudent = await prisma.students.delete({
        where: {id}
    });

    return deletedStudent;
}