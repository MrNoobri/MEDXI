/**
 * Email Provider Interface
 * All email providers must implement this interface
 */
class IEmailProvider {
  /**
   * Send an email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML content
   * @param {string} options.text - Plain text content
   * @param {string} [options.from] - Sender email (optional, uses default)
   * @returns {Promise<Object>} Result object with success status
   */
  async send(options) {
    throw new Error("Method 'send' must be implemented");
  }

  /**
   * Get the provider name
   * @returns {string} Provider name
   */
  getName() {
    throw new Error("Method 'getName' must be implemented");
  }

  /**
   * Check if the provider is configured
   * @returns {boolean} True if configured
   */
  isConfigured() {
    throw new Error("Method 'isConfigured' must be implemented");
  }
}

module.exports = IEmailProvider;
