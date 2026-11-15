const pool = require('../db');

const listarAsignacionesActivas = async () => {
  const query = `
    SELECT ag.id_acceso_guardia,
           ag.id_acceso,
           ag.id_empleado_guardia,
           ag.activo,
           e.nombre || ' ' || e.apellido AS nombre_guardia,
           e.dpi,
           e.telefono,
           a.nombre_acceso,
           est.id_estacion,
           est.nombre_estacion,
           m.nombre AS nombre_municipalidad
    FROM public.accesos_guardias ag
    INNER JOIN public.empleados e ON ag.id_empleado_guardia = e.id_empleado
    INNER JOIN public.accesos a ON ag.id_acceso = a.id_acceso
    INNER JOIN public.estaciones est ON a.id_estacion = est.id_estacion
    INNER JOIN public.municipalidades m ON est.id_municipalidad = m.id_municipalidad
    WHERE ag.activo = true
    ORDER BY est.nombre_estacion ASC, a.nombre_acceso ASC, e.nombre ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const listarGuardiasDisponibles = async () => {
  const query = `
    SELECT e.id_empleado,
           e.nombre,
           e.apellido,
           e.dpi,
           e.telefono
    FROM public.empleados e
    WHERE e.activo = true
      AND UPPER(e.tipo_personal) = 'GUARDIA'
      AND NOT EXISTS (
        SELECT 1
        FROM public.accesos_guardias ag
        WHERE ag.id_empleado_guardia = e.id_empleado
          AND ag.activo = true
      )
    ORDER BY e.nombre ASC, e.apellido ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const listarAccesosActivos = async () => {
  const query = `
    SELECT a.id_acceso,
           a.id_estacion,
           a.nombre_acceso,
           a.descripcion,
           est.nombre_estacion,
           COUNT(ag.id_acceso_guardia) FILTER (WHERE ag.activo = true)::int AS guardias_asignados
    FROM public.accesos a
    INNER JOIN public.estaciones est ON a.id_estacion = est.id_estacion
    LEFT JOIN public.accesos_guardias ag ON a.id_acceso = ag.id_acceso AND ag.activo = true
    WHERE a.activo = true
      AND est.activo = true
    GROUP BY a.id_acceso, est.nombre_estacion
    ORDER BY est.nombre_estacion ASC, a.nombre_acceso ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const obtenerAsignacionActivaPorGuardia = async (idEmpleadoGuardia) => {
  const query = `
    SELECT ag.id_acceso_guardia,
           a.nombre_acceso,
           est.nombre_estacion
    FROM public.accesos_guardias ag
    INNER JOIN public.accesos a ON ag.id_acceso = a.id_acceso
    INNER JOIN public.estaciones est ON a.id_estacion = est.id_estacion
    WHERE ag.id_empleado_guardia = $1
      AND ag.activo = true
  `;
  const { rows } = await pool.query(query, [idEmpleadoGuardia]);
  return rows[0];
};

const verificarGuardiaValido = async (idEmpleadoGuardia) => {
  const query = `
    SELECT id_empleado, nombre, apellido, tipo_personal, activo
    FROM public.empleados
    WHERE id_empleado = $1
  `;
  const { rows } = await pool.query(query, [idEmpleadoGuardia]);
  return rows[0];
};

const verificarAccesoValido = async (idAcceso) => {
  const query = `
    SELECT a.id_acceso, a.activo AS acceso_activo, e.activo AS estacion_activo
    FROM public.accesos a
    INNER JOIN public.estaciones e ON a.id_estacion = e.id_estacion
    WHERE a.id_acceso = $1
  `;
  const { rows } = await pool.query(query, [idAcceso]);
  return rows[0];
};

const crearAsignacion = async ({ id_acceso, id_empleado_guardia }) => {
  const query = `
    INSERT INTO public.accesos_guardias (id_acceso, id_empleado_guardia, activo)
    VALUES ($1, $2, true)
    RETURNING id_acceso_guardia, id_acceso, id_empleado_guardia, activo
  `;
  const { rows } = await pool.query(query, [id_acceso, id_empleado_guardia]);
  return rows[0];
};

const liberarAsignacion = async (idAccesoGuardia) => {
  const query = `
    UPDATE public.accesos_guardias
    SET activo = false
    WHERE id_acceso_guardia = $1
    RETURNING id_acceso_guardia
  `;
  const { rows } = await pool.query(query, [idAccesoGuardia]);
  return rows[0];
};

module.exports = {
  listarAsignacionesActivas,
  listarGuardiasDisponibles,
  listarAccesosActivos,
  obtenerAsignacionActivaPorGuardia,
  verificarGuardiaValido,
  verificarAccesoValido,
  crearAsignacion,
  liberarAsignacion,
};