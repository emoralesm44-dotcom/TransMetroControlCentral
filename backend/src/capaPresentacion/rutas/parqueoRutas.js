const express = require('express');
const router = express.Router();
const controlador = require('../../capaLogica/controladores/parqueoController');
const { verificarAutenticacion, requerirRol } = require('../../capaLogica/middlewares/authMiddleware');

router.use(verificarAutenticacion);

router.get('/', controlador.listar);
router.post('/', requerirRol('ADMINISTRADOR', 'SUPERVISOR'), controlador.crear);
router.put('/:id', requerirRol('ADMINISTRADOR', 'SUPERVISOR'), controlador.actualizar);
router.patch('/:id/estado', requerirRol('ADMINISTRADOR', 'SUPERVISOR'), controlador.actualizarEstado);

module.exports = router;