const nodemailer = require("nodemailer");

// Builds a transporter from env vars. If SMTP isn't configured (common
// during local development), we don't crash — we just log the email
// content to the console so the flow (e.g. password reset) is still testable.
const isSmtpConfigured = () =>
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

const sendEmail = async ({ to, subject, html }) => {
  if (!isSmtpConfigured()) {
    console.log("\n--- SMTP not configured: email logged instead of sent ---");
    console.log(`To: ${to}\nSubject: ${subject}\n${html}`);
    console.log("--------------------------------------------------------\n");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"EMS" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
