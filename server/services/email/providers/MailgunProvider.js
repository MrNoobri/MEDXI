const mailgun = require("mailgun-js");
const IEmailProvider = require("./IEmailProvider");

class MailgunProvider extends IEmailProvider {
  constructor() {
    super();
    if (this.isConfigured()) {
      this.mg = mailgun({
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
      });
    }
  }

  async send({ to, subject, html, text, from }) {
    try {
      const data = {
        from: from || process.env.MAILGUN_FROM_EMAIL || "noreply@medxi.com",
        to,
        subject,
        text: text || "",
        html,
      };

      const response = await this.mg.messages().send(data);

      return {
        success: true,
        provider: "mailgun",
        messageId: response.id,
      };
    } catch (error) {
      throw new Error(`Mailgun error: ${error.message}`);
    }
  }

  getName() {
    return "Mailgun";
  }

  isConfigured() {
    return !!(
      process.env.MAILGUN_API_KEY &&
      process.env.MAILGUN_DOMAIN &&
      process.env.MAILGUN_FROM_EMAIL
    );
  }
}

module.exports = MailgunProvider;
