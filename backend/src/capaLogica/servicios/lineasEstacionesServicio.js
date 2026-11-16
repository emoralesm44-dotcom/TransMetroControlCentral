const lineaEstacionDatos = require('../../capaDatos/modelos/lineasEstacionesDatosModelo');

const obtenerRutaLinea = async (idLinea) => {
  const id = Number(idLinea);
  if (!id) {
    throw new Error('Debe indicar una línea válida.');
  }
  const [ruta, disponibles] = await Promise.all([
    lineaEstacionDatos.listarPorLinea(id),
    lineaEstacionDatos.listarEstacionesDisponibles(id),
  ]);
  return { ruta, disponibles };
};

const guardarRuta = async (idLinea, estaciones) => {
  const id = Number(idLinea);
  if (!id) {
    throw new Error('Debe seleccionar una línea.');
  }
  if (!Array.isArray(estaciones)) {
    throw new Error('Formato de estaciones no válido.');
  }

  const idsUnicos = new Set();
  for (let i = 0; i < estaciones.length; i++) {
    const est = estaciones[i];
    const idEst = Number(est.id_estacion);
    if (!idEst) {
      throw new Error(`Estación inválida en la posición ${i + 1}.`);
    }
    if (idsUnicos.has(idEst)) {
      throw new Error('No se puede repetir la misma estación dentro de la misma línea.');
    }
    idsUnicos.add(idEst);

    const dist = Number(est.distancia_siguiente_km ?? 0);
    if (Number.isNaN(dist) || dist < 0) {
      throw new Error(`La distancia en la parada #${i + 1} no puede ser negativa.`);
    }
    if (i < estaciones.length - 1 && dist <= 0) {
      throw new Error(`Debe ingresar una distancia mayor a 0 km desde la parada #${i + 1} hacia la siguiente.`);
    }
  }

  return await lineaEstacionDatos.guardarRutaCompleta(id, estaciones);
};

module.exports = {
  obtenerRutaLinea,
  guardarRuta,
};