const pool = require('../db');

const listarUsuarios = async () => {
  const query = `
    SELECT u.id_usuario,
           u.id_empleado,
           u.nombre_usuario AS username,
           u.rol,
           u.activo,
           e.nombre || ' ' || e.apellido AS nombre_empleado,
           e.dpi,
           e.tipo_personal
    FROM public.usuarios u
    INNER JOIN public.empleados e ON u.id_empleado = e.id_empleado
    ORDER BY u.id_usuario ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const obtenerPorId = async (id) => {
  const query = `
    SELECT id_usuario, id_empleado, nombre_usuario AS username, rol, activo
    FROM public.usuarios
    WHERE id_usuario = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const obtenerPorUsername = async (username) => {
  const query = `
    SELECT id_usuario FROM public.usuarios WHERE LOWER(nombre_usuario) = LOWER($1)
  `;
  const { rows } = await pool.query(query, [username]);
  return rows[0];
};

const obtenerPorEmpleado = async (idEmpleado) => {
  const query = `
    SELECT id_usuario FROM public.usuarios WHERE id_empleado = $1
  `;
  const { rows } = await pool.query(query, [idEmpleado]);
  return rows[0];
};

const crearUsuario = async ({ id_empleado, username, password_hash, rol, activo }) => {
  const query = `
    INSERT INTO public.usuarios (id_empleado, nombre_usuario, contrasenia, rol, activo)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id_usuario, id_empleado, nombre_usuario AS username, rol, activo
  `;
  const { rows } = await pool.query(query, [
    id_empleado,
    username,
    password_hash,
    rol,
    activo ?? true,
  ]);
  return rows[0];
};

const actualizarUsuario = async (id, { username, rol, activo, password_hash }) => {
  if (password_hash) {
    const query = `
      UPDATE public.usuarios
      SET nombre_usuario = $1, rol = $2, activo = $3, contrasenia = $4
      WHERE id_usuario = $5
      RETURNING id_usuario, id_empleado, nombre_usuario AS username, rol, activo
    `;
    const { rows } = await pool.query(query, [username, rol, activo, password_hash, id]);
    return rows[0];
  }

  const query = `
    UPDATE public.usuarios
    SET nombre_usuario = $1, rol = $2, activo = $3
    WHERE id_usuario = $4
    RETURNING id_usuario, id_empleado, nombre_usuario AS username, rol, activo
  `;
  const { rows } = await pool.query(query, [username, rol, activo, id]);
  return rows[0];
};

const cambiarEstadoUsuario = async (id, activo) => {
  const query = `
    UPDATE public.usuarios
    SET activo = $1
    WHERE id_usuario = $2
    RETURNING id_usuario, nombre_usuario AS username, activo
  `;
  const { rows } = await pool.query(query, [activo, id]);
  return rows[0];
};

module.exports = {
  listarUsuarios,
  obtenerPorId,
  obtenerPorUsername,
  obtenerPorEmpleado,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
};