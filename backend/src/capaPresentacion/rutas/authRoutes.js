const express = require('express');
const router = express.Router();
const { loginSeguro, obtenerPerfil, logout } = require('../../capaLogica/controladores/authController');
const { loginRateLimiter } = require('../../capaLogica/middlewares/seguridadMiddleware');

router.post('/login', loginRateLimiter, loginSeguro);
router.post('/logout', logout);
router.get('/perfil', obtenerPerfil);

module.exports = router;