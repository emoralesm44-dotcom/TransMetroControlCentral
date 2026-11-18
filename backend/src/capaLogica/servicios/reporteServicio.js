const reporteDatos = require('../../capaDatos/modelos/reportesDatosModelo');

const obtenerReporte = async (tipo) => {
  switch (tipo) {
    case 'estaciones':
      return await reporteDatos.reporteEstaciones();
    case 'lineas':
      return await reporteDatos.reporteLineasRutas();
    case 'buses':
      return await reporteDatos.reporteBusesPorLinea();
    case 'accesos-linea':
      return await reporteDatos.reporteAccesosPorLinea();
    case 'alertas':
      return await reporteDatos.reporteAlertasCapacidad();
    case 'parqueos':
      return await reporteDatos.reporteParqueosFlota();
    case 'pilotos':
      return await reporteDatos.reportePilotos();
    default:
      throw new Error('Tipo de reporte no válido.');
  }
};

module.exports = {
  obtenerReporte,
};