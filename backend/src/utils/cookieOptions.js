const getJwtExpiresInSeconds = () => {
  const val = parseInt(process.env.JWT_EXPIRES_IN_SECONDS, 10);
  return (!isNaN(val) && val > 0) ? val : 604800; // default 7 days in seconds
};

const getCookieOptions = (overrides = {}) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const rawSameSite = (process.env.COOKIE_SAMESITE || 'lax').toLowerCase().trim();
  const allowedSameSite = ['lax', 'strict', 'none'];
  const sameSite = allowedSameSite.includes(rawSameSite) ? rawSameSite : 'lax';

  // If COOKIE_SAMESITE=none then force secure=true (required by browser spec)
  const secure = sameSite === 'none' ? true : isProduction;

  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: getJwtExpiresInSeconds() * 1000,
    ...overrides
  };
};

module.exports = { getCookieOptions, getJwtExpiresInSeconds };

