"use server";
import nodemailer, { SentMessageInfo } from 'nodemailer';
import { prisma } from '@/lib/prisma';

type SendResult = { ok: true; info: SentMessageInfo } | { ok: false; message: string };

/**
 * Send an email to admin(s) notifying them that a new student registered and
 * they should verify the student's name/email. The email includes approve
 * and reject links that point to the app's admin verification page.
 *
 * Environment variables used:
 * - EMAIL_USER, EMAIL_PASS: smtp credentials
 * - ADMIN_EMAILS or ADMIN_EMAIL: comma-separated list or single admin email
 * - NEXT_PUBLIC_APP_URL or APP_URL: base URL for links (defaults to https://sta-pink.vercel.app)
 */
export const sendStudentVerificationRequest = async (
    studentId: string
): Promise<SendResult> => {
    const student = await prisma.students.findUnique({ where: { id: studentId } });

    if (!student) return { ok: false, message: 'Student not found' };

    const emails = await prisma.admins.findMany({
        select:{
            email: true
        }
    })

    const adminEmails = emails.map((mails)=>(mails.email))
    if (adminEmails.length === 0) return { ok: false, message: 'No admin email configured (empty after parsing)' };
    console.log(adminEmails)

    const appUrl = 'https://sta-pink.vercel.app/';

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const htmlBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>New student registration — please verify</h2>
            <p>An account was just created and requires admin verification.</p>
            <ul>
                <li><strong>Name:</strong> ${student.name ?? '—'}</li>
                <li><strong>Email:</strong> ${student.email}</li>
            </ul>
            <p style="margin-top:14px;">
                <a href="${appUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:10px 14px;background:#2563eb;color:#ffffff;border-radius:6px;text-decoration:none;">
                    Open the App
                </a>
            </p>
            <br/>
            <p>Best regards,<br/>Appointment Team</p>
        </div>
    `;

    const mailOptions = {
        from: `"Appointment Team" <${process.env.EMAIL_USER}>`,
        to: adminEmails.join(','),
        subject: `New student registration — verify: ${student.name ?? student.email}`,
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