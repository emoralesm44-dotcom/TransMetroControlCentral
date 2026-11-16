const express = require('express');
const router = express.Router();
const controlador = require('../../capaLogica/controladores/operadorEstacionController');
const { verificarAutenticacion, requerirRol } = require('../../capaLogica/middlewares/authMiddleware');

router.use(verificarAutenticacion);

router.get('/', controlador.listar);
router.post('/', requerirRol('ADMINISTRADOR', 'SUPERVISOR'), controlador.crear);
router.patch('/:id/liberar', requerirRol('ADMINISTRADOR', 'SUPERVISOR'), controlador.desactivar);

module.exports = router;