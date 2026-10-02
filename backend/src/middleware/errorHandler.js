/**
 * Centralized error handling middleware.
 * Catches unhandled errors passed via next(err).
 * Handles Mongoose ValidationError, CastError (invalid ObjectId),
 * duplicate key E11000, and JSON parsing syntax errors.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 && res.statusCode !== 201
    ? res.statusCode
    : 500;
  let message = err.message || "Internal Server Error";

  // 1. JSON parsing syntax errors from express.json() / body-parser
  if (
    (err instanceof SyntaxError && (err.status === 400 || err.statusCode === 400)) ||
    err.type === 'entity.parse.failed'
  ) {
    statusCode = 400;
    message = "Malformed JSON payload: Please check request body syntax.";
  }
  // 2. Mongoose CastError (e.g. invalid ObjectId in params/query)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field '${err.path || 'id'}': ${err.value}`;
  }
  // 3. Mongoose ValidationError
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors || {}).map((e) => e.message);
    message = errors.length > 0 ? errors.join(', ') : "Validation error";
  }
  // 4. Mongo duplicate key error (code 11000)
  else if (err.code === 11000 || (err.name === 'MongoServerError' && err.code === 11000)) {
    statusCode = 409;
    const duplicateFields = Object.keys(err.keyValue || {});
    const fieldName = duplicateFields.length > 0 ? duplicateFields.join(', ') : 'field';
    message = `A resource with that ${fieldName} already exists.`;
  }
  // 5. Custom status codes set on error object
  else if (typeof err.status === 'number' && err.status >= 400 && err.status < 600) {
    statusCode = err.status;
  } else if (typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600) {
    statusCode = err.statusCode;
  }

  const response = {
    message
  };

  // In production, strip stack traces from JSON response
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
