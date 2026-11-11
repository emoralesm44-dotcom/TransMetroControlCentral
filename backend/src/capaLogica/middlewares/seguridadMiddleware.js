const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos fallidos. Intente de nuevo en 15 minutos.' }
});

const aplicarHelmet = helmet({
  contentSecurityPolicy: true,
  crossOriginResourcePolicy: { policy: "same-origin" }
});

module.exports = { loginRateLimiter, aplicarHelmet };