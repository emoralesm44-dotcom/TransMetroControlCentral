const express = require('express');
const router = express.Router();
const dashboardControlador = require('../../capaLogica/controladores/dashboardControladro');
const { verificarAutenticacion, requerirRol } = require('../../capaLogica/middlewares/authMiddleware');

router.get(
  '/resumen',
  verificarAutenticacion,
  requerirRol('ADMINISTRADOR', 'SUPERVISOR'),
  dashboardControlador.obtenerResumen
);

router.patch(
  '/alertas/:id/atender',
  verificarAutenticacion,
  requerirRol('ADMINISTRADOR', 'SUPERVISOR'),
  dashboardControlador.atenderAlerta
);

module.exports = router;