"use server";
import { prisma } from "@/lib/prisma";
import { DateTime } from "next-auth/providers/kakao";
import { sendAppointmentRequest } from "../handleMails/sendAppointmentRequest";
import { sendAppointmentStatus } from "../handleMails/sendAppointmentStatus";

export const addAppointment = async({teacherId, studentId, time, subject, studentName, teacherName, createdAt, message} :{
    studentName: string,
    teacherName: string,
    teacherId: string,
    studentId: string,
    time: DateTime,
    subject: string,
    createdAt: DateTime,
    message: string
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
                message,
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

        await sendAppointmentRequest(studentName, teacherId, time, subject, message);

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
            },
            orderBy:{
                time: 'asc'
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
            },
            orderBy:{
                time: 'asc'
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
                status: stat==="rejected" ? 'cancelled' : 'upcoming'
            }
        });

        await sendAppointmentStatus(updatedAppointment.studentId, updatedAppointment.subject, stat, updatedAppointment.teacherName, updatedAppointment.time.toISOString());

        return updatedAppointment;
    }catch(err){
        console.log(err);
        return null;
    }
}

export const cancellAppointment = async(appointmentId: string)=>{
    try{
        const cancelledAppointment = await prisma.appointments.update({
            where:{
                id: appointmentId,
            },
            data:{
                status:"cancelled"
            }
        });
        return cancelledAppointment;
    }catch(err){
        console.log(err);
    }
}