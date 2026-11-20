const pool = require('../db');

const obtenerEstacion = async (usuario) => {
  const idEmpleado = Number(usuario?.emp || 0);
  if (!idEmpleado) return null;
  const { rows } = await pool.query(`
    SELECT e.id_estacion, e.nombre_estacion, m.nombre AS municipalidad
    FROM public.operador_estacion oe
    JOIN public.estaciones e ON oe.id_estacion = e.id_estacion AND e.activo = true
    JOIN public.municipalidades m ON e.id_municipalidad = m.id_municipalidad
    WHERE oe.id_empleado_operador = $1 AND oe.activo = true LIMIT 1
  `, [idEmpleado]);
  return rows[0] || null;
};

const resumenMiEstacion = async (idEstacion) => {
  const [recorridos, alertas] = await Promise.all([
    pool.query(`
      SELECT r.id_recorrido, b.codigo_unidad, b.capacidad_maxima, l.nombre_linea, r.pasajeros, r.hora_llegada, r.hora_salida, r.estado
      FROM public.recorridos_bus r
      JOIN public.buses b ON r.id_bus = b.id_bus
      JOIN public.lineas l ON r.id_linea = l.id_linea
      WHERE r.id_estacion = $1 ORDER BY r.hora_llegada DESC LIMIT 15
    `, [idEstacion]),
    pool.query(`
      SELECT ra.id_alerta, COALESCE(b.codigo_unidad, 'N/A') AS bus, ra.tipo_alerta AS tipo,
             COALESCE(ra.mensaje, 'Pasajeros: ' || ra.pasajeros_reportados) AS mensaje,
             ra.fecha_hora AS fecha, COALESCE(ra.estado, 'ACTIVA') AS estado
      FROM public.registro_alertas ra
      LEFT JOIN public.buses b ON ra.id_bus = b.id_bus
      WHERE ra.id_estacion = $1 ORDER BY ra.fecha_hora DESC LIMIT 5
    `, [idEstacion])
  ]);
  return { recorridos: recorridos.rows, alertas: alertas.rows };
};

const catalogosLlegada = async (idEstacion) => {
  const [lineas, buses] = await Promise.all([
    pool.query(`
      SELECT DISTINCT l.id_linea, l.nombre_linea
      FROM public.lineas l
      JOIN public.linea_estaciones le ON l.id_linea = le.id_linea AND le.activo = true
      WHERE le.id_estacion = $1 AND l.activo = true ORDER BY l.nombre_linea
    `, [idEstacion]),
    pool.query(`
      SELECT id_bus, codigo_unidad, COALESCE(placa, '-') AS placa, capacidad_maxima, id_linea
      FROM public.buses
      WHERE activo = true AND id_linea IN (SELECT id_linea FROM public.linea_estaciones WHERE id_estacion = $1 AND activo = true)
      ORDER BY codigo_unidad
    `, [idEstacion])
  ]);
  return { lineas: lineas.rows, buses: buses.rows };
};

const pendientesSalida = async (idEstacion) => {
  const { rows } = await pool.query(`
    SELECT r.id_recorrido, b.codigo_unidad, l.nombre_linea, r.pasajeros, r.hora_llegada
    FROM public.recorridos_bus r
    JOIN public.buses b ON r.id_bus = b.id_bus
    JOIN public.lineas l ON r.id_linea = l.id_linea
    WHERE r.id_estacion = $1 AND r.hora_salida IS NULL ORDER BY r.hora_llegada ASC
  `, [idEstacion]);
  return rows;
};

const todasLasAlertas = async (idEstacion) => {
  const { rows } = await pool.query(`
    SELECT ra.id_alerta, COALESCE(b.codigo_unidad, 'N/A') AS bus, ra.tipo_alerta AS tipo,
           COALESCE(ra.mensaje, 'Pasajeros: ' || ra.pasajeros_reportados) AS mensaje,
           ra.fecha_hora AS fecha, COALESCE(ra.estado, 'ACTIVA') AS estado
    FROM public.registro_alertas ra
    LEFT JOIN public.buses b ON ra.id_bus = b.id_bus
    WHERE ra.id_estacion = $1 ORDER BY ra.fecha_hora DESC
  `, [idEstacion]);
  return rows;
};

const buscarBus = async (idBus) => {
  const { rows } = await pool.query('SELECT codigo_unidad, capacidad_maxima FROM public.buses WHERE id_bus = $1', [idBus]);
  return rows[0];
};

const guardarLlegada = async (d) => {
  const { rows } = await pool.query(`
    INSERT INTO public.recorridos_bus (id_estacion, id_linea, id_bus, pasajeros, hora_llegada, observaciones)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
  `, [d.id_estacion, d.id_linea, d.id_bus, d.pasajeros, d.hora_llegada, d.observacion || null]);
  return rows[0];
};

const guardarAlerta = async (d) => {
  await pool.query(`
    INSERT INTO public.registro_alertas (id_estacion, id_bus, pasajeros_reportados, tipo_alerta, mensaje, fecha_hora, estado)
    VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVA')
  `, [d.id_estacion, d.id_bus, d.pasajeros, d.tipo, d.mensaje, d.fecha]);
};

const guardarSalida = async (idRecorrido, idEstacion, horaSalida, observacion) => {
  const { rows } = await pool.query(`
    UPDATE public.recorridos_bus
    SET hora_salida = $1,
        observaciones = CONCAT_WS(E'\\n', NULLIF(BTRIM(observaciones), ''), NULLIF(BTRIM($2), '')),
        estado = 'COMPLETADO'
    WHERE id_recorrido = $3 AND id_estacion = $4 AND hora_salida IS NULL RETURNING *
  `, [horaSalida, observacion || null, idRecorrido, idEstacion]);
  return rows[0];
};

const recorridoEnEstacion = async (idEstacion) => {
  const { rows } = await pool.query(`
    SELECT r.id_recorrido, r.pasajeros, r.hora_llegada, b.codigo_unidad, b.capacidad_maxima, l.nombre_linea
    FROM public.recorridos_bus r
    JOIN public.buses b ON r.id_bus = b.id_bus
    JOIN public.lineas l ON r.id_linea = l.id_linea
    WHERE r.id_estacion = $1 AND r.hora_salida IS NULL ORDER BY r.hora_llegada DESC LIMIT 1
  `, [idEstacion]);
  return rows[0] || null;
};

module.exports = {
  obtenerEstacion,
  resumenMiEstacion,
  catalogosLlegada,
  pendientesSalida,
  todasLasAlertas,
  buscarBus,
  guardarLlegada,
  guardarAlerta,
  guardarSalida,
  recorridoEnEstacion
};