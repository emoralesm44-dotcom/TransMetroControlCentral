const express = require('express');
const router = express.Router();
const controlador = require('../../capaLogica/controladores/estacionController');
const { verificarAutenticacion, requerirRol } = require('../../capaLogica/middlewares/authMiddleware');

router.use(verificarAutenticacion);

router.get('/', controlador.listar);
router.post('/', requerirRol('ADMINISTRADOR', 'SUPERVISOR'), controlador.crear);
router.put('/:id', requerirRol('ADMINISTRADOR', 'SUPERVISOR'), controlador.actualizar);
router.patch('/:id/estado', requerirRol('ADMINISTRADOR', 'SUPERVISOR'), controlador.actualizarEstado);


router.get('/:id/accesos', controlador.listarAccesos);
router.post('/:id/accesos', requerirRol('ADMINISTRADOR', 'SUPERVISOR'), controlador.crearAcceso);
router.put('/accesos/:idAcceso', requerirRol('ADMINISTRADOR', 'SUPERVISOR'), controlador.actualizarAcceso);
router.patch('/accesos/:idAcceso/estado', requerirRol('ADMINISTRADOR', 'SUPERVISOR'), controlador.actualizarEstadoAcceso);

module.exports = router;