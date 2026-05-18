import nodemailer from 'nodemailer';

const SMTP_HOST     = process.env.SMTP_HOST;
const SMTP_PORT     = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER     = process.env.SMTP_USER;
const SMTP_PASS     = process.env.SMTP_PASS;
const SMTP_FROM     = process.env.SMTP_FROM || 'CA Aspire BD <noreply@caaspirebd.com>';
const FRONTEND_URL  = process.env.FRONTEND_URL || 'https://optireachhub.com';

const isConfigured = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);

let transporter = null;
if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendVerificationEmail(name, email, token) {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  if (!isConfigured) {
    console.log(`\n[EMAIL - DEV] Verification link for ${email}:\n${verifyUrl}\n`);
    return;
  }

  await transporter.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: 'Verify your CA Aspire BD account',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#06112e;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;">
          <h1 style="margin:0;font-size:24px;font-weight:800;">CA Aspire BD</h1>
          <p style="margin:4px 0 0;font-size:12px;opacity:0.7;letter-spacing:2px;text-transform:uppercase;">Premium Platform</p>
        </div>
        <div style="padding:40px;">
          <h2 style="margin:0 0 12px;font-size:20px;">Hi ${name}, verify your email</h2>
          <p style="color:rgba(255,255,255,0.6);line-height:1.6;margin:0 0 28px;">
            You're one step away from accessing CA Aspire BD. Click the button below to verify your email address and activate your account.
          </p>
          <a href="${verifyUrl}"
            style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;">
            Verify Email Address
          </a>
          <p style="color:rgba(255,255,255,0.35);font-size:12px;margin:24px 0 0;">
            This link expires in 24 hours. If you didn't create an account, ignore this email.
          </p>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0;" />
          <p style="color:rgba(255,255,255,0.25);font-size:11px;margin:0;">
            Can't click the button? Copy this link:<br/>
            <span style="color:rgba(255,255,255,0.4);word-break:break-all;">${verifyUrl}</span>
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(name, email) {
  if (!isConfigured) return;

  await transporter.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: 'Welcome to CA Aspire BD!',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#06112e;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;">
          <h1 style="margin:0;font-size:24px;font-weight:800;">CA Aspire BD</h1>
        </div>
        <div style="padding:40px;">
          <h2 style="margin:0 0 12px;">Welcome aboard, ${name}!</h2>
          <p style="color:rgba(255,255,255,0.6);line-height:1.6;margin:0;">
            Your account is now active. Start your CA exam preparation at
            <a href="${FRONTEND_URL}" style="color:#818cf8;">${FRONTEND_URL}</a>
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(name, email, token) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  if (!isConfigured) {
    console.log(`\n[EMAIL - DEV] Password reset link for ${email}:\n${resetUrl}\n`);
    return;
  }

  await transporter.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: 'Reset your CA Aspire BD password',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#06112e;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;">
          <h1 style="margin:0;font-size:24px;font-weight:800;">CA Aspire BD</h1>
          <p style="margin:4px 0 0;font-size:12px;opacity:0.7;letter-spacing:2px;text-transform:uppercase;">Password Reset</p>
        </div>
        <div style="padding:40px;">
          <h2 style="margin:0 0 12px;font-size:20px;">Hi ${name}, reset your password</h2>
          <p style="color:rgba(255,255,255,0.6);line-height:1.6;margin:0 0 28px;">
            We received a request to reset the password for your CA Aspire BD account. Click the button below to choose a new password.
          </p>
          <a href="${resetUrl}"
            style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;">
            Reset Password
          </a>
          <p style="color:rgba(255,255,255,0.35);font-size:12px;margin:24px 0 0;">
            This link expires in <strong style="color:rgba(255,255,255,0.5);">1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password won't change.
          </p>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0;" />
          <p style="color:rgba(255,255,255,0.25);font-size:11px;margin:0;">
            Can't click the button? Copy this link:<br/>
            <span style="color:rgba(255,255,255,0.4);word-break:break-all;">${resetUrl}</span>
          </p>
        </div>
      </div>
    `,
  });
}
