const reporteDatos = require('../../capaDatos/modelos/reportesDatosModelo');

const REPORTES = {
  estaciones: reporteDatos.reporteEstaciones,
  lineas: reporteDatos.reporteLineasRutas,
  parqueos: reporteDatos.reporteParqueosFlota,
};

const obtenerReporte = async (tipo) => {
  const consultar = REPORTES[tipo];

  if (!consultar) {
    throw new Error('Tipo de reporte no válido.');
  }

  return consultar();
};

module.exports = { obtenerReporte };
