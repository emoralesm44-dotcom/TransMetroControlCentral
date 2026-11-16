const pool = require('../db');

const listarAsignaciones = async () => {
  const query = `
    SELECT oe.id_operador_estacion,
           oe.id_empleado_operador,
           oe.id_estacion,
           oe.activo,
           emp.nombre || ' ' || emp.apellido AS nombre_operador,
           emp.dpi,
           u.nombre_usuario,
           e.nombre_estacion,
           m.nombre AS nombre_municipalidad
    FROM public.operador_estacion oe
    INNER JOIN public.empleados emp ON oe.id_empleado_operador = emp.id_empleado
    LEFT JOIN public.usuarios u ON emp.id_empleado = u.id_empleado
    INNER JOIN public.estaciones e ON oe.id_estacion = e.id_estacion
    INNER JOIN public.municipalidades m ON e.id_municipalidad = m.id_municipalidad
    ORDER BY oe.activo DESC, oe.id_operador_estacion DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const listarOperadoresDisponibles = async () => {
  const query = `
    SELECT emp.id_empleado,
           emp.nombre,
           emp.apellido,
           emp.dpi,
           u.nombre_usuario
    FROM public.empleados emp
    INNER JOIN public.usuarios u ON emp.id_empleado = u.id_empleado
    WHERE emp.activo = true
      AND UPPER(emp.tipo_personal) = 'OPERADOR_ESTACION'
      AND u.activo = true
      AND UPPER(u.rol) = 'OPERADOR_ESTACION'
      AND NOT EXISTS (
        SELECT 1
        FROM public.operador_estacion oe
        WHERE oe.id_empleado_operador = emp.id_empleado
          AND oe.activo = true
      )
    ORDER BY emp.nombre ASC, emp.apellido ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const listarEstacionesDisponibles = async () => {
  const query = `
    SELECT e.id_estacion,
           e.nombre_estacion,
           m.nombre AS nombre_municipalidad
    FROM public.estaciones e
    INNER JOIN public.municipalidades m ON e.id_municipalidad = m.id_municipalidad
    WHERE e.activo = true
      AND NOT EXISTS (
        SELECT 1
        FROM public.operador_estacion oe
        WHERE oe.id_estacion = e.id_estacion
          AND oe.activo = true
      )
    ORDER BY e.nombre_estacion ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const verificarEmpleadoOperadorConUsuario = async (idEmpleado) => {
  const query = `
    SELECT emp.id_empleado,
           emp.tipo_personal,
           emp.activo AS empleado_activo,
           u.id_usuario,
           u.rol,
           u.activo AS usuario_activo
    FROM public.empleados emp
    LEFT JOIN public.usuarios u ON emp.id_empleado = u.id_empleado
    WHERE emp.id_empleado = $1
  `;
  const { rows } = await pool.query(query, [idEmpleado]);
  return rows[0];
};

const verificarOperadorOcupado = async (idEmpleado) => {
  const query = `
    SELECT oe.id_operador_estacion, e.nombre_estacion
    FROM public.operador_estacion oe
    INNER JOIN public.estaciones e ON oe.id_estacion = e.id_estacion
    WHERE oe.id_empleado_operador = $1
      AND oe.activo = true
  `;
  const { rows } = await pool.query(query, [idEmpleado]);
  return rows[0];
};

const verificarEstacionOcupada = async (idEstacion) => {
  const query = `
    SELECT oe.id_operador_estacion, emp.nombre || ' ' || emp.apellido AS nombre_operador
    FROM public.operador_estacion oe
    INNER JOIN public.empleados emp ON oe.id_empleado_operador = emp.id_empleado
    WHERE oe.id_estacion = $1
      AND oe.activo = true
  `;
  const { rows } = await pool.query(query, [idEstacion]);
  return rows[0];
};

const crearAsignacion = async ({ id_empleado_operador, id_estacion }) => {
  const query = `
    INSERT INTO public.operador_estacion (id_empleado_operador, id_estacion, activo)
    VALUES ($1, $2, true)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [id_empleado_operador, id_estacion]);
  return rows[0];
};

const liberarAsignacion = async (id) => {
  const query = `
    UPDATE public.operador_estacion
    SET activo = false
    WHERE id_operador_estacion = $1
    RETURNING *
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

module.exports = {
  listarAsignaciones,
  listarOperadoresDisponibles,
  listarEstacionesDisponibles,
  verificarEmpleadoOperadorConUsuario,
  verificarOperadorOcupado,
  verificarEstacionOcupada,
  crearAsignacion,
  liberarAsignacion,
};