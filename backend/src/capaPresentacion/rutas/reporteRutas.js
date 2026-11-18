const express = require('express');
const router = express.Router();
const controlador = require('../../capaLogica/controladores/reporteController');
const { verificarAutenticacion, requerirRol } = require('../../capaLogica/middlewares/authMiddleware');

router.use(verificarAutenticacion);
router.get('/:tipo', requerirRol('ADMINISTRADOR', 'SUPERVISOR'), controlador.consultar);

module.exports = router;