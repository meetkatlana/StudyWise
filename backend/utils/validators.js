/**
 * Lightweight validators for auth inputs.
 * Zero dependencies — keeps the auth surface auditable.
 */

// RFC 5322-lite — pragmatic email shape check.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) =>
  typeof email === "string" &&
  email.length <= 255 &&
  EMAIL_RE.test(email.trim());

/**
 * Password policy:
 *  - 8-72 chars (bcrypt truncates >72)
 *  - at least one lowercase, one uppercase, one digit
 */
const validatePassword = (password) => {
  if (typeof password !== "string") return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 72) return "Password must be at most 72 characters";
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
  if (!/\d/.test(password))   return "Password must contain a number";
  return null; // valid
};

const validateName = (name) => {
  if (typeof name !== "string") return "Name is required";
  const trimmed = name.trim();
  if (trimmed.length < 2)   return "Name must be at least 2 characters";
  if (trimmed.length > 120) return "Name must be at most 120 characters";
  return null;
};

module.exports = { isValidEmail, validatePassword, validateName };