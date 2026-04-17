// src/utils/emailService.ts
import nodemailer from 'nodemailer';
import config from '../config';


// const transporter = nodemailer.createTransport({
//   host:   process.env.SMTP_HOST,
//   port:   Number(process.env.SMTP_PORT) || 587,
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });
const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: Number(config.email.port),
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.email.address,
      pass: config.email.pass,
    },
  });

export interface UnpaidIntentEmailData {
  bookId:        string;
  guestName:     string;
  guestEmail:    string;
  guestPhone:    string;
  guestMobile:    string;
  amount:        number;
  currency:      string;
  checkoutUrl:   string;
  paymentIntent: string;
  createdAt:     Date;
}

export const sendUnpaidIntentEmailToOrganizer = async (
  data: UnpaidIntentEmailData,
): Promise<void> => {
  const organizerEmail = process.env.ORGANIZER_EMAIL!;
  const minutesAgo     = Math.round(
    (Date.now() - data.createdAt.getTime()) / 60000,
  );

  await transporter.sendMail({
    from:    `"Booking System" <${process.env.SMTP_USER}>`,
    to:      organizerEmail,
    subject: `⚠️ Unpaid Booking Alert — Book ID: ${data.bookId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">⚠️ Payment Not Completed</h2>
        </div>

        <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; font-size: 16px;">
            A guest initiated payment <strong>${minutesAgo} minutes ago</strong> but has not completed it.
            You may want to reach out to them directly.
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f9fafb;">
              <td style="padding: 10px 14px; font-weight: bold; color: #6b7280; width: 40%;">Booking ID</td>
              <td style="padding: 10px 14px; color: #111827;">${data.bookId}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #6b7280;">Guest Name</td>
              <td style="padding: 10px 14px; color: #111827;">${data.guestName}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 10px 14px; font-weight: bold; color: #6b7280;">Guest Email</td>
              <td style="padding: 10px 14px; color: #111827;">
                <a href="mailto:${data.guestEmail}">${data.guestEmail}</a>
              </td>
            </tr>
             <tr style="background: #f9fafb;">
              <td style="padding: 10px 14px; font-weight: bold; color: #6b7280;">Guest Phone</td>
              <td style="padding: 10px 14px; color: #111827;">
                <a href="tel:${data.guestPhone}">${data.guestPhone}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #6b7280;">Amount Due</td>
              <td style="padding: 10px 14px; color: #111827;">
                ${data.currency} ${(data.amount).toLocaleString()}
              </td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 10px 14px; font-weight: bold; color: #6b7280;">Intent Created</td>
              <td style="padding: 10px 14px; color: #111827;">
                ${data.createdAt.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })} (ICT)
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #6b7280;">Payment Intent ID</td>
              <td style="padding: 10px 14px; color: #111827; font-size: 13px;">${data.paymentIntent}</td>
            </tr>
          </table>

          <div style="margin: 24px 0;">
            <a href="${data.checkoutUrl}"
               style="background: #3b82f6; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Checkout Link
            </a>
          </div>

          <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">
            This is an automated alert. The checkout link may still be active.
          </p>
        </div>
      </div>
    `,
  });
};