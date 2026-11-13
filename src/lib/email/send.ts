import nodemailer from "nodemailer";
import { env } from "@/env.js";

export function isEmailConfigured(): boolean {
  return Boolean(env.GMAIL_USER && env.GMAIL_APP_PASSWORD);
}

function getTransporter() {
  if (!isEmailConfigured()) return null;
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: env.GMAIL_USER,
      pass: env.GMAIL_APP_PASSWORD?.replace(/\s/g, ""),
    },
  });
}

export function appOrigin(): string {
  return (
    env.NEXT_PUBLIC_APP_URL ?? env.AUTH_URL ?? "http://localhost:3000"
  );
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<{ sent: boolean; logged: boolean }> {
  const from = env.EMAIL_FROM ?? env.GMAIL_USER;
  const transport = getTransporter();

  if (!transport || !from) {
    console.info(
      `[email] To: ${options.to}\nSubject: ${options.subject}\n\n${options.text}`,
    );
    return { sent: false, logged: true };
  }

  try {
    await transport.sendMail({
      from: `"Native Speak" <${from}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html ?? options.text.replace(/\n/g, "<br>\n"),
    });
    return { sent: true, logged: false };
  } catch (error) {
    console.error("[email] Gmail SMTP failed:", error);
    console.info(
      `[email fallback] To: ${options.to}\n\n${options.text}`,
    );
    return { sent: false, logged: true };
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${appOrigin()}/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
  return sendEmail({
    to: email,
    subject: "Verify your Native Speak account",
    text: `Hi,\n\nVerify your email to sign in:\n\n${verifyUrl}\n\nThis link expires in 24 hours.\n\n— Native Speak`,
    html: `<p>Hi,</p><p>Verify your email to sign in:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p><p>— Native Speak</p>`,
  });
}

export async function sendInviteEmail(
  email: string,
  role: string,
  invitePath: string,
) {
  const inviteUrl = `${appOrigin()}${invitePath}`;
  return sendEmail({
    to: email,
    subject: `You're invited to Native Speak (${role})`,
    text: `You've been invited as ${role} on Native Speak.\n\nAccept the invite and create your password:\n\n${inviteUrl}\n\nThis link expires in 48 hours.\n\n— Native Speak`,
    html: `<p>You've been invited as <strong>${role}</strong> on Native Speak.</p><p><a href="${inviteUrl}">Accept invite</a></p><p>Or open: ${inviteUrl}</p><p>This link expires in 48 hours.</p>`,
  });
}
