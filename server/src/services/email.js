import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const isDev = process.env.NODE_ENV !== 'production';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send an email. In development, logs to console instead of sending.
 * @param {object} options
 * @param {string} options.to — Recipient email
 * @param {string} options.subject — Email subject
 * @param {string} options.html — HTML body
 * @param {string} [options.text] — Plain text fallback
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Glamour'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@glamour.io'}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
  };

  if (isDev) {
    console.log('\n📧 [DEV EMAIL]');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${text || html.replace(/<[^>]*>/g, '').substring(0, 200)}...`);
    console.log('');
    return { messageId: 'dev-' + Date.now() };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send error:', error.message);
    // Don't throw — email failure shouldn't break the request
    return null;
  }
};

// ── Template Methods ──────────────────────────────────────────────────

export const sendWelcomeEmail = async (email, firstName) => {
  return sendEmail({
    to: email,
    subject: 'Welcome to Glamour! 💇',
    html: `
      <h2>Welcome to Glamour, ${firstName}!</h2>
      <p>We're thrilled to have you join our platform. You can now browse and book salon services across India.</p>
      <p>Get started by exploring our featured salons!</p>
      <br>
      <p>— The Glamour Team</p>
    `,
  });
};

export const sendVerificationEmail = async (email, firstName, token) => {
  const verifyUrl = `${process.env.APP_URL || 'http://localhost:5000'}/api/v1/auth/verify-email?token=${token}`;
  return sendEmail({
    to: email,
    subject: 'Verify your Glamour account',
    html: `
      <h2>Hi ${firstName},</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify Email</a></p>
      <p>This link expires in 24 hours.</p>
      <br>
      <p>— The Glamour Team</p>
    `,
  });
};

export const sendPasswordResetEmail = async (email, firstName, token) => {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  return sendEmail({
    to: email,
    subject: 'Reset your Glamour password',
    html: `
      <h2>Hi ${firstName},</h2>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      <br>
      <p>— The Glamour Team</p>
    `,
  });
};

export const sendBookingConfirmationEmail = async (email, booking, salon, service) => {
  return sendEmail({
    to: email,
    subject: `Booking Confirmed — ${salon.name}`,
    html: `
      <h2>Booking Confirmation</h2>
      <p>Your booking has been confirmed! Here are the details:</p>
      <table style="border-collapse: collapse;">
        <tr><td style="padding: 4px 12px; font-weight: bold;">Salon:</td><td>${salon.name}</td></tr>
        <tr><td style="padding: 4px 12px; font-weight: bold;">Service:</td><td>${service.name}</td></tr>
        <tr><td style="padding: 4px 12px; font-weight: bold;">Date:</td><td>${booking.booking_date || booking.date}</td></tr>
        <tr><td style="padding: 4px 12px; font-weight: bold;">Time:</td><td>${booking.booking_time || booking.time}</td></tr>
        <tr><td style="padding: 4px 12px; font-weight: bold;">Duration:</td><td>${service.duration}</td></tr>
        <tr><td style="padding: 4px 12px; font-weight: bold;">Price:</td><td>₹${service.price}</td></tr>
      </table>
      <br>
      <p>— The Glamour Team</p>
    `,
  });
};

export const sendBookingCancellationEmail = async (email, booking, salon, service, reason) => {
  return sendEmail({
    to: email,
    subject: `Booking Cancelled — ${salon.name}`,
    html: `
      <h2>Booking Cancelled</h2>
      <p>Your booking at <strong>${salon.name}</strong> for <strong>${service.name}</strong> on <strong>${booking.booking_date || booking.date}</strong> at <strong>${booking.booking_time || booking.time}</strong> has been cancelled.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>You can rebook anytime on our platform.</p>
      <br>
      <p>— The Glamour Team</p>
    `,
  });
};

export const sendReviewRequestEmail = async (email, customerName, salon) => {
  return sendEmail({
    to: email,
    subject: `How was your visit to ${salon.name}?`,
    html: `
      <h2>Hi ${customerName},</h2>
      <p>We hope you enjoyed your visit to <strong>${salon.name}</strong>!</p>
      <p>Would you like to leave a review? Your feedback helps other customers find great salons.</p>
      <br>
      <p>— The Glamour Team</p>
    `,
  });
};

export const sendPartnerApplicationEmail = async (email, ownerName, status, reason) => {
  const statusMessages = {
    pending: 'We have received your application and will review it within 3-5 business days.',
    approved: 'Congratulations! Your salon application has been approved. You can now log in and set up your salon profile.',
    rejected: `We regret to inform you that your application has been declined.${reason ? ` Reason: ${reason}` : ''}`,
  };

  return sendEmail({
    to: email,
    subject: `Glamour Partner Application — ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    html: `
      <h2>Hi ${ownerName},</h2>
      <p>${statusMessages[status] || 'Your application status has been updated.'}</p>
      <br>
      <p>— The Glamour Team</p>
    `,
  });
};

export default sendEmail;
