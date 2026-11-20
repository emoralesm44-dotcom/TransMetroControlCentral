// Importación del limitador de peticiones y cabeceras HTTP 
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Limita a 25 intentos cada 15 minutos en  inicio de sesión para mitigar fuerza bruta
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos fallidos. Intente de nuevo en 15 minutos.' }
});

// Configura cabeceras HTTP de seguridad 
const aplicarHelmet = helmet({
  contentSecurityPolicy: true,
  crossOriginResourcePolicy: { policy: "same-origin" }
});


module.exports = { loginRateLimiter, aplicarHelmet };