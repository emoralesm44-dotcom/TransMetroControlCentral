const pool = require('../db');

const queryDB = async (sql) => (await pool.query(sql)).rows;

// 1. REPORTE DE ESTACIONES
const reporteEstaciones = () => queryDB(`
  SELECT e.id_estacion, e.nombre_estacion, m.nombre AS municipalidad,
    COALESCE(l.lineas, 'Sin líneas asignadas') AS lineas_asignadas,
    COALESCE(a.accesos, 'Sin accesos') AS accesos,
    COALESCE(p.parqueos, 'No tiene parqueo') AS parqueo
  FROM public.estaciones e
  JOIN public.municipalidades m ON e.id_municipalidad = m.id_municipalidad
  LEFT JOIN LATERAL (
    SELECT STRING_AGG(DISTINCT li.nombre_linea, ', ' ORDER BY li.nombre_linea) AS lineas
    FROM public.linea_estaciones le
    JOIN public.lineas li ON li.id_linea = le.id_linea AND li.activo = true
    WHERE le.id_estacion = e.id_estacion AND le.activo = true
  ) l ON true
  LEFT JOIN LATERAL (
    SELECT STRING_AGG(DISTINCT a.nombre_acceso || ' (' ||
      COALESCE(g.guardia, 'Sin guardia') || ')', ', ') AS accesos
    FROM public.accesos a
    LEFT JOIN LATERAL (
      SELECT STRING_AGG(DISTINCT emp.nombre || ' ' || emp.apellido, ', ') AS guardia
      FROM public.accesos_guardias ag
      JOIN public.empleados emp ON emp.id_empleado = ag.id_empleado_guardia
      WHERE ag.id_acceso = a.id_acceso AND ag.activo = true
    ) g ON true
    WHERE a.id_estacion = e.id_estacion AND a.activo = true
  ) a ON true
  LEFT JOIN LATERAL (
    SELECT STRING_AGG(pq.nombre_parqueo, ', ' ORDER BY pq.nombre_parqueo) AS parqueos
    FROM public.parqueos pq
    WHERE pq.id_estacion = e.id_estacion AND pq.activo = true
  ) p ON true
  ORDER BY e.id_estacion
`);

// 2. REPORTE DE LÍNEAS Y BUSES
const reporteLineasRutas = () => queryDB(`
  SELECT l.id_linea, l.nombre_linea, m.nombre AS municipalidad,
    COALESCE(e.cantidad_estaciones, 0) AS cantidad_estaciones,
    COALESCE(l.distancia_total_km, 0) AS distancia_total_km,
    COALESCE(b.buses_asignados, 0) AS buses_asignados,
    COALESCE(b.placas, 'Sin placas registradas') AS placas
  FROM public.lineas l
  JOIN public.municipalidades m ON m.id_municipalidad = l.id_municipalidad
  LEFT JOIN LATERAL (
    SELECT COUNT(DISTINCT id_estacion) AS cantidad_estaciones
    FROM public.linea_estaciones
    WHERE id_linea = l.id_linea AND activo = true
  ) e ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS buses_asignados,
      STRING_AGG(placa, ', ' ORDER BY placa) FILTER (
        WHERE placa IS NOT NULL AND placa <> ''
      ) AS placas
    FROM public.buses
    WHERE id_linea = l.id_linea AND activo = true
  ) b ON true
  WHERE l.activo = true
  ORDER BY l.id_linea
`);

// 3. REPORTE DE PARQUEOS (Actualizado para mostrar la placa)
const reporteParqueosFlota = () => queryDB(`
  SELECT pq.id_parqueo, pq.nombre_parqueo,
    COALESCE(e.nombre_estacion, 'Parqueo general') AS estacion_asociada,
    pq.capacidad_unidades,
    COALESCE(b.buses_asignados, 0) AS buses_asignados,
    GREATEST(0, pq.capacidad_unidades - COALESCE(b.buses_asignados, 0)) AS espacios_libres,
    COALESCE(b.unidades, 'Sin unidades asignadas') AS listado_unidades
  FROM public.parqueos pq
  LEFT JOIN public.estaciones e ON e.id_estacion = pq.id_estacion
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS buses_asignados,
      STRING_AGG(placa, ', ' ORDER BY placa) AS unidades
    FROM public.buses
    WHERE id_parqueo = pq.id_parqueo AND activo = true AND placa IS NOT NULL AND placa <> ''
  ) b ON true
  WHERE pq.activo = true
  ORDER BY pq.id_parqueo
`);

module.exports = {
  reporteEstaciones,
  reporteLineasRutas,
  reporteParqueosFlota,
};