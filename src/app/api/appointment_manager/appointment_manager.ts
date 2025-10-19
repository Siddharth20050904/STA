"use server";
import { prisma } from "@/lib/prisma";
import { DateTime } from "next-auth/providers/kakao";

export const addAppointment = async({teacherId, studentId, time, subject} :{
    teacherId: string,
    studentId: string,
    time: DateTime,
    subject: string,
})=>{
    try{
        const appointment = await prisma.appointments.create({
            data:{
                time: time,
                subject,
                teacher : {
                    connect:{
                        id: teacherId
                    }
                },
                student:{
                    connect:{
                        id: studentId
                    }
                }
            }
        });

        return appointment;
    }catch(err){
        console.log(err);
        return null
    }
}