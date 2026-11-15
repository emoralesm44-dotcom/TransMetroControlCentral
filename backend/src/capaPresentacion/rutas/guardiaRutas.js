const express = require('express');
const router = express.Router();
const controlador = require('../../capaLogica/controladores/guardiaController');
const { verificarAutenticacion, requerirRol } = require('../../capaLogica/middlewares/authMiddleware');

router.use(verificarAutenticacion);

router.get('/', controlador.listar);
router.post('/', requerirRol('ADMINISTRADOR', 'SUPERVISOR'), controlador.crear);
router.delete('/:id', requerirRol('ADMINISTRADOR', 'SUPERVISOR'), controlador.eliminar);

module.exports = router;