const dashboardDatos = require('../../capaDatos/modelos/dashboardModel');

const obtenerResumenDashboard = async () => {
  const metricas = await dashboardDatos.obtenerMetricasGenerales();

  const porcentajeFlotaActiva = metricas.buses.total > 0
    ? Math.round((metricas.buses.activos / metricas.buses.total) * 100)
    : 0;

  return {
    ...metricas,
    porcentajeFlotaActiva,
  };
};

const atenderAlerta = async (idAlerta) => {
  const id = Number(idAlerta);
  if (!id || Number.isNaN(id)) {
    throw new Error('ID de alerta inválido.');
  }

  const actualizada = await dashboardDatos.marcarAlertaAtendida(id);
  if (!actualizada) {
    throw new Error('La alerta no existe o ya fue atendida previamente.');
  }

  return actualizada;
};

module.exports = { obtenerResumenDashboard, atenderAlerta };