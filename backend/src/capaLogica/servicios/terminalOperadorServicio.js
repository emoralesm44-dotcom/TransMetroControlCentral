const datos = require('../../capaDatos/modelos/terminalOperadorDatos');

const exigirEstacion = async (idU) => {
  const e = await datos.obtenerEstacion(idU);
  if (!e) throw new Error('No tiene una estación asignada.');
  return e;
};

const respEstacion = async (idU, fnResumen, extraKeys = {}) => {
  const estacion = await datos.obtenerEstacion(idU);
  if (!estacion) return { pendiente: true, estacion: null, ...extraKeys };
  const res = fnResumen ? await fnResumen(estacion.id_estacion) : {};
  return { pendiente: false, estacion, ...(typeof res === 'object' ? res : { [fnResumen.name]: res }) };
};

const obtenerMiEstacion = (idU) => respEstacion(idU, datos.resumenMiEstacion);

const obtenerDatosLlegada = async (idU) => {
  const estacion = await datos.obtenerEstacion(idU);
  if (!estacion) return { pendiente: true, estacion: null, lineas: [], buses: [], activo: null };
  const [catalogos, activo] = await Promise.all([datos.catalogosLlegada(estacion.id_estacion), datos.recorridoEnEstacion(estacion.id_estacion)]);
  return { pendiente: false, estacion, ...catalogos, activo };
};

const obtenerDatosSalida = (idU) => respEstacion(idU, datos.pendientesSalida, { pendientes: [] });
const obtenerDatosAlertas = (idU) => respEstacion(idU, datos.todasLasAlertas, { alertas: [] });

const registrarLlegada = async (idU, body) => {
  const estacion = await exigirEstacion(idU);
  const pasajeros = Number(body.pasajeros);
  if (Number.isNaN(pasajeros) || pasajeros < 0) throw new Error('Cantidad de pasajeros inválida.');

  const bus = await datos.buscarBus(body.id_bus);
  if (!bus) throw new Error('Bus no encontrado.');

  const fecha = body.hora_llegada || new Date().toISOString();
  const recorrido = await datos.guardarLlegada({ id_estacion: estacion.id_estacion, id_linea: body.id_linea, id_bus: body.id_bus, pasajeros, hora_llegada: fecha, observacion: body.observacion });

  const pct = bus.capacidad_maxima > 0 ? Math.round((pasajeros / bus.capacidad_maxima) * 100) : 0;
  if (pct >= 150 || pct < 25) {
    const tipo = pct >= 150 ? 'SOBRECUPO' : 'BAJA_OCUPACION';
    const mensaje = pct >= 150 
      ? `Sobrecupo (${pct}%): ${pasajeros}/${bus.capacidad_maxima} en ${bus.codigo_unidad}. Solicitar unidad de apoyo.`
      : `Baja ocupación (${pct}%): ${pasajeros}/${bus.capacidad_maxima} en ${bus.codigo_unidad}. Esperar 5 min adicionales.`;
    await datos.guardarAlerta({ id_estacion: estacion.id_estacion, id_bus: body.id_bus, pasajeros, tipo, mensaje, fecha });
  }

  return recorrido;
};

const registrarSalida = async (idU, idRecorrido, body) => {
  const estacion = await exigirEstacion(idU);
  const actualizado = await datos.guardarSalida(idRecorrido, estacion.id_estacion, body.hora_salida || new Date().toISOString(), body.observacion_salida);
  if (!actualizado) throw new Error('Recorrido no válido o ya finalizado.');
  return actualizado;
};

module.exports = { obtenerMiEstacion, obtenerDatosLlegada, obtenerDatosSalida, obtenerDatosAlertas, registrarLlegada, registrarSalida };