const pool = require('../db');

const obtenerMetricasGenerales = async () => {
  const [
    lineas,
    buses,
    parqueos,
    estaciones,
    alertasActivas,
    usuarios,
    recorridosHoy,
    ultimasAlertas,
    ocupacionPorLinea
  ] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE activo = true)::int AS activas FROM public.lineas`),
    pool.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE activo = true)::int AS activos FROM public.buses`),
    pool.query(`SELECT COUNT(*)::int AS total FROM public.parqueos WHERE activo = true`),
    pool.query(`SELECT COUNT(*)::int AS total FROM public.estaciones WHERE activo = true`),
    pool.query(`SELECT COUNT(*)::int AS total FROM public.registro_alertas WHERE estado = 'ACTIVA'`),
    pool.query(`SELECT COUNT(*)::int AS total FROM public.usuarios WHERE activo = true`),
    pool.query(`
      SELECT 
        COUNT(*)::int AS viajes_hoy,
        COUNT(*) FILTER (WHERE hora_salida IS NULL)::int AS buses_en_estacion,
        COALESCE(SUM(pasajeros), 0)::int AS pasajeros_hoy
      FROM public.recorridos_bus
      WHERE DATE(hora_llegada) = CURRENT_DATE
    `),
    pool.query(`
      SELECT ra.id_alerta, e.nombre_estacion AS estacion, COALESCE(b.codigo_unidad, 'N/A') AS bus,
             ra.tipo_alerta AS tipo, ra.mensaje, ra.fecha_hora AS fecha, ra.estado
      FROM public.registro_alertas ra
      JOIN public.estaciones e ON ra.id_estacion = e.id_estacion
      LEFT JOIN public.buses b ON ra.id_bus = b.id_bus
      ORDER BY ra.fecha_hora DESC
      LIMIT 8
    `),
    pool.query(`
      SELECT l.nombre_linea, COUNT(r.id_recorrido)::int AS recorridos, COALESCE(SUM(r.pasajeros), 0)::int AS pasajeros
      FROM public.lineas l
      LEFT JOIN public.recorridos_bus r ON l.id_linea = r.id_linea AND DATE(r.hora_llegada) = CURRENT_DATE
      WHERE l.activo = true
      GROUP BY l.id_linea, l.nombre_linea
      ORDER BY pasajeros DESC
    `)
  ]);

  return {
    lineas: lineas.rows[0],
    buses: buses.rows[0],
    parqueos: parqueos.rows[0].total,
    estaciones: estaciones.rows[0].total,
    alertasActivas: alertasActivas.rows[0].total,
    usuariosActivos: usuarios.rows[0].total,
    operacionHoy: recorridosHoy.rows[0],
    ultimasAlertas: ultimasAlertas.rows,
    ocupacionPorLinea: ocupacionPorLinea.rows
  };
};

const marcarAlertaAtendida = async (idAlerta) => {
  const { rows } = await pool.query(`
    UPDATE public.registro_alertas
    SET estado = 'ATENDIDA'
    WHERE id_alerta = $1 AND estado = 'ACTIVA'
    RETURNING *
  `, [idAlerta]);
  return rows[0] || null;
};

module.exports = { obtenerMetricasGenerales, marcarAlertaAtendida };