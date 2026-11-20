// Configuración de Express Router y dependencias de autenticació
const express = require('express');
const router = express.Router();
const { loginSeguro, obtenerPerfil, logout } = require('../../capaLogica/controladores/authController');
const { loginRateLimiter } = require('../../capaLogica/middlewares/seguridadMiddleware');

// Rutas de autenticación: inicio con límite de intentos, cierre de sesión y consulta de perfil
router.post('/login', loginRateLimiter, loginSeguro);
router.post('/logout', logout);
router.get('/perfil', obtenerPerfil);

module.exports = router;