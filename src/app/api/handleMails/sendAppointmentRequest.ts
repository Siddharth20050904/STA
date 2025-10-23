"use server";
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

export const sendAppointmentRequest = async (
    studentName: string,
    teacherId: string,
    time: string,
    subject: string,
    message?: string
) => {
    const teacher = await prisma.teachers.findUnique({
        where: {
            id: teacherId,
        },
    });

    if (!teacher) return {ok: false, message: "User not Found!!"};

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const trimmedMessage = message ? message.trim() : '';

    // Parse the provided time and format date and time separately according to teacher's locale/timezone.
    const parsedDate = new Date(time);
    let formattedDate = '';
    let formattedTime = '';

    // Try to read locale/timezone from teacher record, otherwise fall back to env or sensible defaults.
    type TeacherLocaleInfo = { locale?: string; timezone?: string; time_zone?: string };
    const teacherInfo = teacher as TeacherLocaleInfo;
    const locale = teacherInfo.locale || process.env.DEFAULT_LOCALE || 'en-US';
    const timeZone = teacherInfo.timezone || teacherInfo.time_zone || process.env.DEFAULT_TIMEZONE || 'UTC';

    if (!isNaN(parsedDate.getTime())) {
        try {
            formattedDate = new Intl.DateTimeFormat(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone,
            }).format(parsedDate);

            formattedTime = new Intl.DateTimeFormat(locale, {
                hour: 'numeric',
                minute: '2-digit',
                timeZone,
            }).format(parsedDate);
        } catch {
            // Fallback to basic locale formatting if Intl throws for some reason
            formattedDate = parsedDate.toLocaleDateString();
            formattedTime = parsedDate.toLocaleTimeString();
        }
    }

    const tzLabel = timeZone ? ` (${timeZone})` : '';

    const htmlBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Hello ${teacher.name},</h2>
            <p>${studentName} has requested a meeting with you.</p>
            <ul>
                <li><strong>Subject:</strong> ${subject}</li>
                ${
                    formattedDate
                        ? `<li><strong>Date:</strong> ${formattedDate}</li>`
                        : ''
                }
                ${
                    formattedTime
                        ? `<li><strong>Time:</strong> ${formattedTime}${tzLabel}</li>`
                        : `<li><strong>Requested time:</strong> ${time}</li>`
                }
            </ul>
            ${
                trimmedMessage
                    ? `<div style="margin-top:12px;"><p><strong>Student's message:</strong></p><p style="white-space:pre-wrap;">${trimmedMessage}</p></div>`
                    : ''
            }
            <p style="margin-top:16px;">Please respond to this request via the app.</p>
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
        to: teacher.email,
        subject: `Appointment Request from ${studentName} — ${subject}`,
        html: htmlBody,
    };

        try {
            const res = await transporter.sendMail(mailOptions);
            return res;
        } catch (err: unknown) {
            // Normalize unknown error to a string message so the caller can handle/log it
            const errMsg = err instanceof Error ? err.message : String(err);
            return `Failed to send email: ${errMsg}`;
        }
};