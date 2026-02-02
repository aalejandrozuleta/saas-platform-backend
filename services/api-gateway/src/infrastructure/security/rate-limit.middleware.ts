import rateLimit from 'express-rate-limit';

/**
 * Rate limiter global por IP.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter estricto para endpoints sensibles.
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});
