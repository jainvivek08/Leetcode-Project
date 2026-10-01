const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

// Rate limiting constants (configurable via env if needed, with safe defaults)
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_MAX = 10;

const REGISTER_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const REGISTER_MAX = 5;

const SUBMIT_WINDOW_MS = 60 * 1000; // 1 minute
const SUBMIT_MAX = 10;

const RUN_WINDOW_MS = 60 * 1000; // 1 minute
const RUN_MAX = 20;

const AI_CHAT_WINDOW_MS = 60 * 1000; // 1 minute
const AI_CHAT_MAX = 10;

const getGeneralLimitMax = () => {
  const envVal = parseInt(process.env.GENERAL_RATE_LIMIT_MAX, 10);
  if (!isNaN(envVal) && envVal > 0) return envVal;
  return process.env.NODE_ENV === 'production' ? 300 : 3000;
};

const getGeneralLimitWindowMs = () => {
  const envVal = parseInt(process.env.GENERAL_RATE_LIMIT_WINDOW_MINUTES, 10);
  const minutes = (!isNaN(envVal) && envVal > 0) ? envVal : 15;
  return minutes * 60 * 1000;
};

const isSkippedGeneralRoute = (req) => {
  if (req.method !== 'GET') return false;
  const rawPath = req.originalUrl
    ? req.originalUrl.split('?')[0].replace(/\/+$/, '')
    : (req.path || '').replace(/\/+$/, '');
  const skippedPaths = [
    '/user/check',
    '/problem/getAllProblem',
    '/problem/list',
    '/problem/tags',
    '/problem/problemSolvedByUser',
    '/user/getRank',
  ];
  return skippedPaths.includes(rawPath);
};

/**
 * Standard 429 response handler returning JSON with message and retryAfterSeconds.
 */
const createLimitHandler = (defaultMessage) => {
  return (req, res, next, options) => {
    let retryAfterSeconds = Math.ceil(options.windowMs / 1000);
    if (req.rateLimit && req.rateLimit.resetTime) {
      const diff = Math.ceil((req.rateLimit.resetTime.getTime() - Date.now()) / 1000);
      if (diff > 0) retryAfterSeconds = diff;
    }

    const message = typeof options.message === 'string'
      ? options.message
      : (options.message?.message || defaultMessage);

    return res.status(429).json({
      message,
      retryAfterSeconds
    });
  };
};

const buildLimiter = (options) => {
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    handler: createLimitHandler(options.message),
    ...options
  });
};

// 1. Login limiter: 10 requests / 15 min, keyed by IP + normalized emailId.
// Only counts failed logins (skipSuccessfulRequests: true).
const loginLimiter = buildLimiter({
  windowMs: LOGIN_WINDOW_MS,
  limit: LOGIN_MAX,
  skipSuccessfulRequests: true,
  message: "Too many login attempts. Please try again after 15 minutes.",
  keyGenerator: (req) => {
    const ipKey = ipKeyGenerator(req.ip);
    const email = (req.body?.emailId || req.body?.email || '').trim().toLowerCase();
    return `${ipKey}_${email}`;
  }
});

// 2. Register limiter: 5 requests / hour per IP.
const registerLimiter = buildLimiter({
  windowMs: REGISTER_WINDOW_MS,
  limit: REGISTER_MAX,
  message: "Too many accounts created from this IP. Please try again after an hour.",
  keyGenerator: (req) => ipKeyGenerator(req.ip)
});

// 3. Submit limiter: 10 requests / minute per authenticated user id, fallback to IP.
const submitLimiter = buildLimiter({
  windowMs: SUBMIT_WINDOW_MS,
  limit: SUBMIT_MAX,
  message: "Too many submissions. Please wait a minute before submitting again.",
  keyGenerator: (req) => {
    if (req.result && req.result._id) {
      return `user_${req.result._id.toString()}`;
    }
    return `ip_${ipKeyGenerator(req.ip)}`;
  }
});

// 4. Run limiter: 20 requests / minute per authenticated user id, fallback to IP.
const runLimiter = buildLimiter({
  windowMs: RUN_WINDOW_MS,
  limit: RUN_MAX,
  message: "Too many code runs. Please wait a minute before running code again.",
  keyGenerator: (req) => {
    if (req.result && req.result._id) {
      return `user_${req.result._id.toString()}`;
    }
    return `ip_${ipKeyGenerator(req.ip)}`;
  }
});

// 5. AI Chat limiter: 10 requests / minute per authenticated user id, fallback to IP.
const aiChatLimiter = buildLimiter({
  windowMs: AI_CHAT_WINDOW_MS,
  limit: AI_CHAT_MAX,
  message: "Too many AI chat messages. Please wait a minute before sending another prompt.",
  keyGenerator: (req) => {
    if (req.result && req.result._id) {
      return `user_${req.result._id.toString()}`;
    }
    return `ip_${ipKeyGenerator(req.ip)}`;
  }
});

// 6. General limiter: configurable via env, skips frequent read routes.
// Default: 300 in production, 3000 in development per 15 min per IP.
const generalLimiter = buildLimiter({
  windowMs: getGeneralLimitWindowMs(),
  limit: (req, res) => getGeneralLimitMax(),
  skip: (req) => isSkippedGeneralRoute(req),
  message: "Too many requests from this IP. Please try again later.",
  keyGenerator: (req) => ipKeyGenerator(req.ip)
});

module.exports = {
  loginLimiter,
  registerLimiter,
  submitLimiter,
  runLimiter,
  aiChatLimiter,
  generalLimiter
};
