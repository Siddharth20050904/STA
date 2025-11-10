"use server";
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * GET /api/cron_jobs/test_mail
 * A simple server-side endpoint used to test cron/email delivery. When called
 * it sends a test message to the configured test/admin email and returns the
 * send result as JSON.
 *
 * Environment variables:
 * - EMAIL_USER, EMAIL_PASS: SMTP credentials
 * - TEST_EMAIL: recipient for test messages (preferred)
 * - ADMIN_EMAILS / ADMIN_EMAIL: fallback recipient(s)
 */
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }
	const recipient =
		process.env.TEST_EMAIL ||
		(process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',')[0].trim() : undefined) ||
		process.env.ADMIN_EMAIL;

	if (!recipient) {
		console.log('No recipient configured for test mail (set TEST_EMAIL or ADMIN_EMAILS/ADMIN_EMAIL)');
		return new Response(JSON.stringify({ ok: false, message: 'No recipient configured' }), { status: 500 });
	}

	if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
		console.log('Missing EMAIL_USER or EMAIL_PASS environment variables');
		return new Response(JSON.stringify({ ok: false, message: 'Missing SMTP credentials' }), { status: 500 });
	}

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		host: 'smtp.gmail.com',
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

	const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://sta-pink.vercel.app';

	const mailOptions = {
		from: `"STA Cron Test" <${process.env.EMAIL_USER}>`,
		to: recipient,
		subject: 'STA — Cron job test email',
		html: `
			<div style="font-family: Arial, sans-serif; line-height:1.6;">
				<h3>STA — Cron test</h3>
				<p>This is an automated test email sent from the STA cron/test endpoint.</p>
				<p>If you received this, cron/email delivery is working.</p>
				<p><a href="${appUrl}" target="_blank" rel="noopener noreferrer">Open the App</a></p>
				<br/>
				<p>Regards,<br/>STA</p>
			</div>
		`,
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log('Test mail sent:', info.messageId ?? info);
		 return NextResponse.json({ success: true, message: 'Secure cron job executed' });
	} catch (err: unknown) {
		const errMsg = err instanceof Error ? err.message : String(err);
		console.log('Failed to send test mail:', errMsg);
		return new Response(JSON.stringify({ ok: false, message: errMsg }), { status: 500 });
	}
}
