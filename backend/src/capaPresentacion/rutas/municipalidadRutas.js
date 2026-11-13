const express = require('express');
const router = express.Router();
const controlador = require('../../capaLogica/controladores/municipalidadController');
const { verificarAutenticacion, requerirRol } = require('../../capaLogica/middlewares/authMiddleware');

router.use(verificarAutenticacion);

router.get('/', controlador.listar);
router.post('/', requerirRol('ADMINISTRADOR'), controlador.crear);
router.put('/:id', requerirRol('ADMINISTRADOR'), controlador.actualizar);
router.patch('/:id/estado', requerirRol('ADMINISTRADOR'), controlador.actualizarEstado);

module.exports = router;