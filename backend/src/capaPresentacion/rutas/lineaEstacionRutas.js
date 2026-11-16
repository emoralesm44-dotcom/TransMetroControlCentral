const express = require('express');
const router = express.Router();
const controlador = require('../../capaLogica/controladores/lineasEstacionController');
const { verificarAutenticacion, requerirRol } = require('../../capaLogica/middlewares/authMiddleware');

router.use(verificarAutenticacion);

router.get('/:idLinea', controlador.obtenerPorLinea);
router.put('/:idLinea', requerirRol('ADMINISTRADOR', 'SUPERVISOR'), controlador.guardar);

module.exports = router;