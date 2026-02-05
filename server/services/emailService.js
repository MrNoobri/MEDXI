const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const SendGridProvider = require("./email/providers/SendGridProvider");
const MailgunProvider = require("./email/providers/MailgunProvider");
const SMTPProvider = require("./email/providers/SMTPProvider");
const AuditLog = require("../models/AuditLog.model");

class EmailService {
  constructor() {
    // Initialize providers in priority order
    this.providers = [
      new SendGridProvider(),
      new MailgunProvider(),
      new SMTPProvider(),
    ];

    // Filter to only configured providers
    this.configuredProviders = this.providers.filter((p) => p.isConfigured());

    if (this.configuredProviders.length === 0) {
      console.warn("⚠️ No email providers configured. Email functionality will be disabled.");
    } else {
      console.log(
        `✓ Email service initialized with providers: ${this.configuredProviders.map((p) => p.getName()).join(", ")}`,
      );
    }

    // Load and compile templates
    this.templates = this.loadTemplates();
  }

  /**
   * Load and compile Handlebars templates
   */
  loadTemplates() {
    const templatesDir = path.join(__dirname, "email", "templates");
    const templates = {};

    try {
      const templateFiles = {
        verification: "verification.html",
        passwordReset: "password-reset.html",
        appointmentConfirmation: "appointment-confirmation.html",
        alertNotification: "alert-notification.html",
      };

      for (const [key, filename] of Object.entries(templateFiles)) {
        const templatePath = path.join(templatesDir, filename);
        if (fs.existsSync(templatePath)) {
          const templateContent = fs.readFileSync(templatePath, "utf-8");
          templates[key] = handlebars.compile(templateContent);
        } else {
          console.warn(`Template not found: ${filename}`);
        }
      }
    } catch (error) {
      console.error("Error loading email templates:", error);
    }

    return templates;
  }

  /**
   * Send email with retry logic and exponential backoff
   * @param {Object} options - Email options
   * @param {number} maxRetries - Maximum retry attempts (default: 3)
   * @returns {Promise<Object>} Result object
   */
  async sendWithRetry(options, maxRetries = 3) {
    let lastError;

    for (const provider of this.configuredProviders) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(
            `Attempting to send email via ${provider.getName()} (attempt ${attempt}/${maxRetries})`,
          );

          const result = await provider.send(options);

          // Log success
          await this.logEmailAttempt({
            to: options.to,
            subject: options.subject,
            provider: provider.getName(),
            status: "success",
            attempt,
            messageId: result.messageId,
          });

          console.log(`✓ Email sent successfully via ${provider.getName()}`);
          return result;
        } catch (error) {
          lastError = error;
          console.error(
            `✗ Email failed via ${provider.getName()} (attempt ${attempt}): ${error.message}`,
          );

          // Log failure
          await this.logEmailAttempt({
            to: options.to,
            subject: options.subject,
            provider: provider.getName(),
            status: "failed",
            attempt,
            error: error.message,
          });

          // Exponential backoff: wait 2^attempt seconds before retry
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`Waiting ${delay}ms before retry...`);
            await this.sleep(delay);
          }
        }
      }
    }

    // All providers and retries failed
    throw new Error(
      `Failed to send email after ${maxRetries} attempts with all providers. Last error: ${lastError.message}`,
    );
  }

  /**
   * Sleep utility for retry delays
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Log email attempt to audit log
   */
  async logEmailAttempt(data) {
    try {
      await AuditLog.create({
        action: "email_sent",
        details: data,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Failed to log email attempt:", error);
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail({ to, name, verificationUrl }) {
    if (!this.templates.verification) {
      throw new Error("Verification email template not loaded");
    }

    const html = this.templates.verification({
      name,
      verificationUrl,
    });

    return await this.sendWithRetry({
      to,
      subject: "Verify Your Email - MEDXI",
      html,
      text: `Hi ${name},\n\nPlease verify your email by visiting: ${verificationUrl}\n\nThis link expires in 1 hour.`,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail({ to, name, resetUrl }) {
    if (!this.templates.passwordReset) {
      throw new Error("Password reset email template not loaded");
    }

    const html = this.templates.passwordReset({
      name,
      resetUrl,
    });

    return await this.sendWithRetry({
      to,
      subject: "Reset Your Password - MEDXI",
      html,
      text: `Hi ${name},\n\nReset your password by visiting: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, please ignore this email.`,
    });
  }

  /**
   * Send appointment confirmation email
   */
  async sendAppointmentConfirmation({
    to,
    patientName,
    providerName,
    specialization,
    appointmentDate,
    appointmentTime,
    duration,
    reason,
    dashboardUrl,
  }) {
    if (!this.templates.appointmentConfirmation) {
      throw new Error("Appointment confirmation template not loaded");
    }

    const html = this.templates.appointmentConfirmation({
      patientName,
      providerName,
      specialization,
      appointmentDate,
      appointmentTime,
      duration,
      reason,
      dashboardUrl,
    });

    return await this.sendWithRetry({
      to,
      subject: "Appointment Confirmed - MEDXI",
      html,
      text: `Hi ${patientName},\n\nYour appointment with ${providerName} is confirmed for ${appointmentDate} at ${appointmentTime}.`,
    });
  }

  /**
   * Send health alert notification email
   */
  async sendAlertNotification({
    to,
    patientName,
    metricType,
    metricValue,
    unit,
    severity,
    message,
    recommendations,
    critical,
    dashboardUrl,
  }) {
    if (!this.templates.alertNotification) {
      throw new Error("Alert notification template not loaded");
    }

    const severityClass = critical ? "critical" : "warning";

    const html = this.templates.alertNotification({
      patientName,
      metricType,
      metricValue,
      unit,
      severity,
      message,
      recommendations,
      critical,
      severityClass,
      dashboardUrl,
    });

    return await this.sendWithRetry({
      to,
      subject: `${critical ? "🚨 CRITICAL" : "⚠️"} Health Alert - MEDXI`,
      html,
      text: `Hi ${patientName},\n\nHealth Alert: ${metricType} reading of ${metricValue} ${unit} (${severity})\n\n${message}`,
    });
  }

  /**
   * Check if email service is available
   */
  isAvailable() {
    return this.configuredProviders.length > 0;
  }
}

// Export singleton instance
module.exports = new EmailService();
