const pool = require('../db');

const listarParqueos = async () => {
  const query = `
    SELECT p.id_parqueo,
           p.nombre_parqueo,
           p.id_estacion,
           p.capacidad_unidades,
           p.descripcion,
           p.activo,
           e.nombre_estacion,
           m.nombre AS nombre_municipalidad
    FROM public.parqueos p
    INNER JOIN public.estaciones e ON p.id_estacion = e.id_estacion
    INNER JOIN public.municipalidades m ON e.id_municipalidad = m.id_municipalidad
    ORDER BY p.id_parqueo ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const obtenerPorId = async (id) => {
  const query = `
    SELECT id_parqueo, nombre_parqueo, id_estacion, capacidad_unidades, descripcion, activo
    FROM public.parqueos
    WHERE id_parqueo = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const crearParqueo = async ({ nombre_parqueo, id_estacion, capacidad_unidades, descripcion, activo }) => {
  const query = `
    INSERT INTO public.parqueos (nombre_parqueo, id_estacion, capacidad_unidades, descripcion, activo)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id_parqueo, nombre_parqueo, id_estacion, capacidad_unidades, descripcion, activo
  `;
  const { rows } = await pool.query(query, [
    nombre_parqueo,
    id_estacion,
    capacidad_unidades,
    descripcion || null,
    activo ?? true,
  ]);
  return rows[0];
};

const actualizarParqueo = async (
  id,
  { nombre_parqueo, id_estacion, capacidad_unidades, descripcion, activo }
) => {
  const query = `
    UPDATE public.parqueos
    SET nombre_parqueo = $1,
        id_estacion = $2,
        capacidad_unidades = $3,
        descripcion = $4,
        activo = $5
    WHERE id_parqueo = $6
    RETURNING id_parqueo, nombre_parqueo, id_estacion, capacidad_unidades, descripcion, activo
  `;
  const { rows } = await pool.query(query, [
    nombre_parqueo,
    id_estacion,
    capacidad_unidades,
    descripcion || null,
    activo,
    id,
  ]);
  return rows[0];
};

const cambiarEstadoParqueo = async (id, activo) => {
  const query = `
    UPDATE public.parqueos
    SET activo = $1
    WHERE id_parqueo = $2
    RETURNING id_parqueo, nombre_parqueo, activo
  `;
  const { rows } = await pool.query(query, [activo, id]);
  return rows[0];
};

module.exports = {
  listarParqueos,
  obtenerPorId,
  crearParqueo,
  actualizarParqueo,
  cambiarEstadoParqueo,
};