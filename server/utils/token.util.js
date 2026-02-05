const crypto = require("crypto");

/**
 * Generate a cryptographically random token and its SHA-256 hash
 * @returns {Object} { token: string, hash: string, expires: Date }
 */
const generateVerificationToken = () => {
  // Generate random token (32 bytes = 64 hex characters)
  const token = crypto.randomBytes(32).toString("hex");

  // Create SHA-256 hash of the token
  const hash = crypto.createHash("sha256").update(token).digest("hex");

  // Set expiry to 1 hour from now
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  return {
    token, // This will be sent in the email
    hash, // This will be stored in the database
    expires,
  };
};

/**
 * Generate a password reset token and its SHA-256 hash
 * @returns {Object} { token: string, hash: string, expires: Date }
 */
const generateResetToken = () => {
  // Generate random token (32 bytes = 64 hex characters)
  const token = crypto.randomBytes(32).toString("hex");

  // Create SHA-256 hash of the token
  const hash = crypto.createHash("sha256").update(token).digest("hex");

  // Set expiry to 1 hour from now
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  return {
    token, // This will be sent in the email
    hash, // This will be stored in the database
    expires,
  };
};

/**
 * Hash a token using SHA-256
 * @param {string} token - The plain token to hash
 * @returns {string} The hashed token
 */
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Verify if a token matches its hash
 * @param {string} token - The plain token
 * @param {string} hash - The stored hash
 * @returns {boolean} True if token matches hash
 */
const verifyTokenHash = (token, hash) => {
  const tokenHash = hashToken(token);
  return tokenHash === hash;
};

module.exports = {
  generateVerificationToken,
  generateResetToken,
  hashToken,
  verifyTokenHash,
};
