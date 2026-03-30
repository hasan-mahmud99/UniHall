const nodemailer = require("nodemailer");

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getFromAddress() {
  return process.env.SMTP_FROM || "UniHall <no-reply@unihall.local>";
}

function createTransporter() {
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = port === 465;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendMail({ to, subject, html, text }) {
  const normalizedTo = String(to || "").trim();
  if (!normalizedTo) {
    const err = new Error("Email recipient is required");
    err.status = 400;
    throw err;
  }

  if (!hasSmtpConfig()) {
    // Dev fallback (still allows end-to-end behavior without SMTP)
    console.log("\n[MAIL:DEV_FALLBACK]");
    console.log("To:", normalizedTo);
    console.log("Subject:", subject);
    if (text) console.log("Text:\n", text);
    if (html) console.log("HTML:\n", html);
    console.log("[/MAIL:DEV_FALLBACK]\n");
    return { delivered: false, reason: "SMTP not configured" };
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: getFromAddress(),
    to: normalizedTo,
    subject: String(subject || ""),
    text: text ? String(text) : undefined,
    html: html ? String(html) : undefined,
  });

  return { delivered: true };
}

module.exports = {
  sendMail,
};
