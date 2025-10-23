"use server";
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { createToken } from '@/lib/jwt';

export const sendVerificationLink = async(email: string)=>{
    const teacher = await prisma.teachers.findUnique({
        where: {email},
    });
    if(!teacher) return "User Not Found!!!";

    const verificationToken = createToken({userId: teacher.id, email: teacher.email, role: teacher.type}, 10*60);
    const teacherWithToken = await prisma.teachers.update({
        where: {email},
        data: {verificationToken}
    });
        

    const transporter = nodemailer.createTransport({
        service: "gmail", // or "outlook", or custom host via 'host' and 'port'
        host:"smtp.gmail.com",
        auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        },
    });
    //TODO: Change the URL link
    // Email content
    const mailOptions = {
        from: `"Verification Team" <${process.env.EMAIL_USER}>`,
        to: teacherWithToken.email,
        subject: "Teacher Verification | Your App Name",
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Hello ${teacherWithToken.name},</h2>
            <p>Thank you for signing up as a teacher! Please verify your email address by clicking the link below:</p>
            <p>
            <a href="https://sta-pink.vercel.app/verify?token=${teacherWithToken.verificationToken}" 
                style="background-color: #4F46E5; color: #fff; padding: 10px 16px; text-decoration: none; border-radius: 6px;">
                Verify Email
            </a>
            </p>
            <p>If you didn’t request this, you can safely ignore this email.</p>
            <br/>
            <p>Best regards,<br/>The Verification Team</p>
        </div>
        `,
    };
    const res = await transporter.sendMail(mailOptions);
    return res;
}

//https://sta-pink.vercel.app/
//http://localhost:3000/