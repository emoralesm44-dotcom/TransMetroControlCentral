const express = require('express');
const router = express.Router();
const { loginSeguro, logout } = require('../../capaLogica/controladores/authControllers');
const { loginRateLimiter } = require('../../capaLogica/middlewares/seguridadMiddleware');

router.post('/login', loginRateLimiter, loginSeguro);
router.post('/logout', logout);

module.exports = router;