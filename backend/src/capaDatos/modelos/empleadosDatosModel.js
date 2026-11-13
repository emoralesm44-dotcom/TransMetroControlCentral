const pool = require('../db'); 

const listarEmpleados = async () => {
  const query = `
    SELECT id_empleado, nombre, apellido, dpi, telefono,
           direccion_residencia, historial_educativo, tipo_personal,
           TO_CHAR(fecha_contratacion, 'YYYY-MM-DD') AS fecha_contratacion, activo
    FROM public.empleados
    ORDER BY id_empleado ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const obtenerPorId = async (id) => {
  const query = `
    SELECT id_empleado, nombre, apellido, dpi, telefono,
           direccion_residencia, historial_educativo, tipo_personal,
           TO_CHAR(fecha_contratacion, 'YYYY-MM-DD') AS fecha_contratacion, activo
    FROM public.empleados
    WHERE id_empleado = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const obtenerPorDpi = async (dpi) => {
  const query = `SELECT id_empleado FROM public.empleados WHERE dpi = $1`;
  const { rows } = await pool.query(query, [dpi]);
  return rows[0];
};

const crearEmpleado = async (datos) => {
  const query = `
    INSERT INTO public.empleados (
      nombre, apellido, dpi, telefono, direccion_residencia,
      historial_educativo, tipo_personal, fecha_contratacion, activo
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, CURRENT_DATE), $9)
    RETURNING id_empleado, nombre, apellido, dpi, telefono,
              direccion_residencia, historial_educativo, tipo_personal,
              TO_CHAR(fecha_contratacion, 'YYYY-MM-DD') AS fecha_contratacion, activo
  `;
  const valores = [
    datos.nombre,
    datos.apellido,
    datos.dpi,
    datos.telefono || null,
    datos.direccion_residencia || null,
    datos.historial_educativo || null,
    datos.tipo_personal,
    datos.fecha_contratacion || null,
    datos.activo ?? true,
  ];
  const { rows } = await pool.query(query, valores);
  return rows[0];
};

const actualizarEmpleado = async (id, datos) => {
  const query = `
    UPDATE public.empleados
    SET nombre = $1,
        apellido = $2,
        dpi = $3,
        telefono = $4,
        direccion_residencia = $5,
        historial_educativo = $6,
        tipo_personal = $7,
        fecha_contratacion = COALESCE($8, fecha_contratacion),
        activo = $9
    WHERE id_empleado = $10
    RETURNING id_empleado, nombre, apellido, dpi, telefono,
              direccion_residencia, historial_educativo, tipo_personal,
              TO_CHAR(fecha_contratacion, 'YYYY-MM-DD') AS fecha_contratacion, activo
  `;
  const valores = [
    datos.nombre,
    datos.apellido,
    datos.dpi,
    datos.telefono || null,
    datos.direccion_residencia || null,
    datos.historial_educativo || null,
    datos.tipo_personal,
    datos.fecha_contratacion || null,
    datos.activo,
    id,
  ];
  const { rows } = await pool.query(query, valores);
  return rows[0];
};

const cambiarEstadoEmpleado = async (id, activo) => {
  const query = `
    UPDATE public.empleados
    SET activo = $1
    WHERE id_empleado = $2
    RETURNING id_empleado, nombre, apellido, activo
  `;
  const { rows } = await pool.query(query, [activo, id]);
  return rows[0];
};

module.exports = {
  listarEmpleados,
  obtenerPorId,
  obtenerPorDpi,
  crearEmpleado,
  actualizarEmpleado,
  cambiarEstadoEmpleado,
};