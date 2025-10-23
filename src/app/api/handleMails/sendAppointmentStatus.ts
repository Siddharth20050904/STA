"use server";
import nodemailer, { SentMessageInfo } from 'nodemailer';
import { prisma } from '@/lib/prisma';

type SendResult = { ok: true; info: SentMessageInfo } | { ok: false; message: string };

export const sendAppointmentStatus = async (
    studentId: string,
    teacherName: string,
    time: string,
    subject: string,
    status: 'approved' | 'rejected' | string
): Promise<SendResult> => {
    const student = await prisma.students.findUnique({
        where: { id: studentId },
    });

    if (!student) return { ok: false, message: 'Student not found' };

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const capitalizedStatus = String(status).charAt(0).toUpperCase() + String(status).slice(1);

    const htmlBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Hello ${student.name ?? student.email},</h2>
            <p>Your appointment request has been <strong>${capitalizedStatus}</strong> by ${teacherName}.</p>
            <ul>
                <li><strong>Subject:</strong> ${subject}</li>
                <li><strong>Time:</strong> ${time}</li>
            </ul>
            <p style="margin-top:12px;">You can view more details in the app.</p>
            <p style="margin-top:12px;">
                <a href="https://sta-pink.vercel.app/" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:10px 14px;background:#2563eb;color:#ffffff;border-radius:6px;text-decoration:none;">
                    Open the App
                </a>
            </p>
            <br/>
            <p>Best regards,<br/>Appointment Team</p>
        </div>
    `;

    const mailOptions = {
        from: `"Appointment Team" <${process.env.EMAIL_USER}>`,
        to: student.email,
        subject: `Your appointment has been ${capitalizedStatus} by ${teacherName}`,
        html: htmlBody,
    };

    try {
    const res = await transporter.sendMail(mailOptions);
    return { ok: true, info: res as SentMessageInfo };
    } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        return { ok: false, message: `Failed to send email: ${errMsg}` };
    }
};