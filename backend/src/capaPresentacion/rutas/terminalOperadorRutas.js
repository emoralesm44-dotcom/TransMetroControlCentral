const router = require('express').Router();
const ctrl = require('../../capaLogica/controladores/terminalOperadorController');
const { verificarAutenticacion, requerirRol } = require('../../capaLogica/middlewares/authMiddleware');

router.use(verificarAutenticacion, requerirRol('OPERADOR_ESTACION', 'ADMINISTRADOR', 'SUPERVISOR'));

router.get('/mi-estacion', ctrl.miEstacion);
router.get('/llegada', ctrl.datosLlegada);
router.post('/llegada', ctrl.guardarLlegada);
router.get('/salida', ctrl.datosSalida);
router.patch('/salida/:id', ctrl.guardarSalida);
router.get('/alertas', ctrl.datosAlertas);

module.exports = router;