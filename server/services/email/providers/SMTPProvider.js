const nodemailer = require("nodemailer");
const IEmailProvider = require("./IEmailProvider");

class SMTPProvider extends IEmailProvider {
  constructor() {
    super();
    if (this.isConfigured()) {
      const emailMode = process.env.EMAIL_MODE || "maildev";

      if (emailMode === "gmail") {
        // Gmail SMTP configuration
        this.transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });
        console.log("📧 Email mode: Gmail SMTP (real emails)");
      } else {
        // Maildev (local development) configuration
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "localhost",
          port: parseInt(process.env.SMTP_PORT) || 1025,
          secure: false,
          ignoreTLS: true,
        });
        console.log("📧 Email mode: Maildev (local testing)");
      }
    }
  }

  async send({ to, subject, html, text, from }) {
    try {
      const emailMode = process.env.EMAIL_MODE || "maildev";
      const fromEmail =
        emailMode === "gmail"
          ? process.env.GMAIL_USER
          : from || process.env.SMTP_FROM_EMAIL || "noreply@medxi.local";

      const info = await this.transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        text: text || "",
        html,
      });

      return {
        success: true,
        provider: "smtp",
        messageId: info.messageId,
      };
    } catch (error) {
      throw new Error(`SMTP error: ${error.message}`);
    }
  }

  getName() {
    return "SMTP";
  }

  isConfigured() {
    const emailMode = process.env.EMAIL_MODE || "maildev";

    if (emailMode === "gmail") {
      // Gmail mode requires Gmail credentials
      return !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
    } else {
      // Maildev mode - always configured (uses defaults)
      return true;
    }
  }
}

module.exports = SMTPProvider;
