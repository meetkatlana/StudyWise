/**
 * Standard error class used across the API.
 * Throwing this from a controller yields a consistent JSON response.
 */
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

module.exports = ApiError;