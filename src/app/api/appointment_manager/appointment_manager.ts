"use server";
import { prisma } from "@/lib/prisma";
import { DateTime } from "next-auth/providers/kakao";

export const addAppointment = async({teacherId, studentId, time, subject, studentName, teacherName, createdAt} :{
    studentName: string,
    teacherName: string,
    teacherId: string,
    studentId: string,
    time: DateTime,
    subject: string,
    createdAt: DateTime
})=>{
    try{
        console.log(teacherId);
        const appointment = await prisma.appointments.create({
            data:{
                time: time,
                subject,
                studentName,
                teacherName,
                createdAt,
                teacher : {
                    connect:{
                        id: teacherId
                    }
                },
                student:{
                    connect:{
                        id: studentId
                    }
                },
            },
            include:{
                teacher: true
            }
        });

        return appointment;
    }catch(err){
        console.log(err);
        return null
    }
}

export const fetchAppointments = async(studentId: string)=>{
    try{
        const today = new Date();
        const oneMonthAgo = new Date(today);
        const oneMonthAhead = new Date(today);
        oneMonthAgo.setMonth(today.getMonth()-1);
        oneMonthAhead.setMonth(today.getMonth()+1);
        const appointments = await prisma.appointments.findMany({
            where:{
                studentId,
                time:{
                    gte: oneMonthAgo,
                    lte: oneMonthAhead
                }
            },
            include:{
                teacher: true
            }
        });
        return appointments;
    }catch(err){
        console.log(err);
    }
}

export const fetchAppointmentsByTeacher = async(teacherId: string)=>{
    try{
        const today = new Date();
        const oneMonthAgo = new Date(today);
        const oneMonthAhead = new Date(today);
        oneMonthAgo.setMonth(today.getMonth()-1);
        oneMonthAhead.setMonth(today.getMonth()+1);
        const appointments = await prisma.appointments.findMany({
            where:{
                teacherId,
                time:{
                    gte: oneMonthAgo,
                    lte: oneMonthAhead
                }
            },
            include:{
                student: true
            }
        });

        return appointments;
    }catch(err){
        console.log(err);
        return null;
    }
}

export const updateAppointmentApprovalStatus = async(appointmentId: string, stat: string)=>{
    try{
        const updatedAppointment = await prisma.appointments.update({
            where:{
                id: appointmentId
            },
            data:{
                approvalStatus: stat === "accepted" ? 'accepted' : 'rejected',
                status: stat==="rejected"?'cancelled':'upcoming'
            }
        });

        return updatedAppointment;
    }catch(err){
        console.log(err);
    }
}