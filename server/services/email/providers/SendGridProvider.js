const sgMail = require("@sendgrid/mail");
const IEmailProvider = require("./IEmailProvider");

class SendGridProvider extends IEmailProvider {
  constructor() {
    super();
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  async send({ to, subject, html, text, from }) {
    try {
      const msg = {
        to,
        from: from || process.env.SENDGRID_FROM_EMAIL || "noreply@medxi.com",
        subject,
        text: text || "",
        html,
      };

      const response = await sgMail.send(msg);

      return {
        success: true,
        provider: "sendgrid",
        messageId: response[0].headers["x-message-id"],
      };
    } catch (error) {
      throw new Error(`SendGrid error: ${error.message}`);
    }
  }

  getName() {
    return "SendGrid";
  }

  isConfigured() {
    return !!(
      process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL
    );
  }
}

module.exports = SendGridProvider;
