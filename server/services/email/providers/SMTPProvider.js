const nodemailer = require("nodemailer");
const IEmailProvider = require("./IEmailProvider");

class SMTPProvider extends IEmailProvider {
  constructor() {
    super();
    if (this.isConfigured()) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async send({ to, subject, html, text, from }) {
    try {
      const info = await this.transporter.sendMail({
        from: from || process.env.SMTP_FROM_EMAIL || "noreply@medxi.com",
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
    return !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );
  }
}

module.exports = SMTPProvider;
