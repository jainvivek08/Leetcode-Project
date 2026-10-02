const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

// Rate limiting constants (configurable via env if needed, with safe defaults)
const AUTH_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const AUTH_MAX = 10;

const SUBMIT_WINDOW_MS = 60 * 1000; // 1 minute
const SUBMIT_MAX = 10;

const RUN_WINDOW_MS = 60 * 1000; // 1 minute
const RUN_MAX = 20;

const AI_CHAT_WINDOW_MS = 60 * 1000; // 1 minute
const AI_CHAT_MAX = 15; // 15 requests per minute

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
  const normalizedPath = rawPath.startsWith('/api/') ? rawPath.slice(4) : (rawPath === '/api' ? '' : rawPath);
  const skippedPaths = [
    '/user/check',
    '/problem/getAllProblem',
    '/problem/list',
    '/problem/tags',
    '/problem/problemSolvedByUser',
    '/user/getRank',
    '/user/activity-heatmap',
    '/problem/daily-challenge',
    '/problem/all-lite',
    '/health',
    '/user/bookmarks',
    '/leaderboard',
    '/user/leaderboard',
  ];
  return skippedPaths.includes(rawPath) || skippedPaths.includes(normalizedPath);
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

// 1. Auth Limiter (Login & Register): 10 requests / 15 minutes per IP.
const authLimiter = buildLimiter({
  windowMs: AUTH_WINDOW_MS,
  limit: AUTH_MAX,
  message: "Too many authentication attempts. Please try again after 15 minutes.",
  keyGenerator: (req) => ipKeyGenerator(req.ip)
});

// Backward-compatible aliases for auth routes
const loginLimiter = authLimiter;
const registerLimiter = authLimiter;

// 2. Submit limiter: 10 requests / minute per authenticated user id, fallback to IP.
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

// 3. Run limiter: 20 requests / minute per authenticated user id, fallback to IP.
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

// 4. AI Assistant / Chat limiter: 15 requests / minute per IP/User (protecting Gemini API quota)
const aiLimiter = buildLimiter({
  windowMs: AI_CHAT_WINDOW_MS,
  limit: AI_CHAT_MAX,
  message: "AI chat rate limit reached. Please wait a moment before sending another prompt.",
  keyGenerator: (req) => {
    if (req.result && req.result._id) {
      return `user_${req.result._id.toString()}`;
    }
    return `ip_${ipKeyGenerator(req.ip)}`;
  }
});

// Backward-compatible alias
const aiChatLimiter = aiLimiter;

// 5. General limiter: configurable via env, skips frequent read routes.
// Default: 300 in production, 3000 in development per 15 min per IP.
const generalLimiter = buildLimiter({
  windowMs: getGeneralLimitWindowMs(),
  limit: (req, res) => getGeneralLimitMax(),
  skip: (req) => isSkippedGeneralRoute(req),
  message: "Too many requests from this IP. Please try again later.",
  keyGenerator: (req) => ipKeyGenerator(req.ip)
});

module.exports = {
  authLimiter,
  loginLimiter,
  registerLimiter,
  submitLimiter,
  runLimiter,
  aiLimiter,
  aiChatLimiter,
  generalLimiter
};
