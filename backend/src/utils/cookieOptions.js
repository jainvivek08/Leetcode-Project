const getJwtExpiresInSeconds = () => {
  const val = parseInt(process.env.JWT_EXPIRES_IN_SECONDS, 10);
  return (!isNaN(val) && val > 0) ? val : 604800; // default 7 days in seconds
};

const getCookieOptions = (overrides = {}) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSite = isProduction ? 'none' : 'lax';
  const secure = isProduction;

  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...overrides
  };
};

const getClearCookieOptions = (overrides = {}) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSite = isProduction ? 'none' : 'lax';
  const secure = isProduction;

  return {
    httpOnly: true,
    secure,
    sameSite,
    ...overrides
  };
};

module.exports = { getCookieOptions, getClearCookieOptions, getJwtExpiresInSeconds };


