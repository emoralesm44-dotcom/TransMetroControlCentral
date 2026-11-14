const express = require('express');
const router = express.Router();
const controlador = require('../../capaLogica/controladores/usuariosController');
const { verificarAutenticacion, requerirRol } = require('../../capaLogica/middlewares/authMiddleware');

router.use(verificarAutenticacion);
router.use(requerirRol('ADMINISTRADOR'));

router.get('/', controlador.listar);
router.post('/', controlador.crear);
router.put('/:id', controlador.actualizar);
router.patch('/:id/estado', controlador.actualizarEstado);

module.exports = router;