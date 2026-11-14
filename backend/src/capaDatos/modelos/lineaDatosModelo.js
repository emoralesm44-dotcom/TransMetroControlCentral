const pool = require('../db');

const listarLineas = async () => {
  const query = `
    SELECT l.id_linea,
           l.codigo_linea,
           l.nombre_linea,
           l.descripcion,
           l.id_municipalidad,
           l.distancia_total_km,
           l.activo,
           m.nombre AS nombre_municipalidad,
           COUNT(le.id_linea_estacion)::int AS total_estaciones
    FROM public.lineas l
    INNER JOIN public.municipalidades m ON l.id_municipalidad = m.id_municipalidad
    LEFT JOIN public.linea_estaciones le ON l.id_linea = le.id_linea AND le.activo = true
    GROUP BY l.id_linea, m.nombre
    ORDER BY l.id_linea ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const obtenerPorId = async (id) => {
  const query = `
    SELECT id_linea, codigo_linea, nombre_linea, descripcion, id_municipalidad, distancia_total_km, activo
    FROM public.lineas
    WHERE id_linea = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const crearLinea = async ({ codigo_linea, nombre_linea, descripcion, id_municipalidad, activo }) => {
  const query = `
    INSERT INTO public.lineas (codigo_linea, nombre_linea, descripcion, id_municipalidad, distancia_total_km, activo)
    VALUES ($1, $2, $3, $4, 0.00, $5)
    RETURNING id_linea, codigo_linea, nombre_linea, descripcion, id_municipalidad, distancia_total_km, activo
  `;
  const { rows } = await pool.query(query, [
    codigo_linea,
    nombre_linea,
    descripcion || null,
    id_municipalidad,
    activo ?? true,
  ]);
  return rows[0];
};

const actualizarLinea = async (id, { codigo_linea, nombre_linea, descripcion, id_municipalidad, activo }) => {
  const query = `
    UPDATE public.lineas
    SET codigo_linea = $1,
        nombre_linea = $2,
        descripcion = $3,
        id_municipalidad = $4,
        activo = $5
    WHERE id_linea = $6
    RETURNING id_linea, codigo_linea, nombre_linea, descripcion, id_municipalidad, distancia_total_km, activo
  `;
  const { rows } = await pool.query(query, [
    codigo_linea,
    nombre_linea,
    descripcion || null,
    id_municipalidad,
    activo,
    id,
  ]);
  return rows[0];
};

const cambiarEstadoLinea = async (id, activo) => {
  const query = `
    UPDATE public.lineas
    SET activo = $1
    WHERE id_linea = $2
    RETURNING id_linea, codigo_linea, nombre_linea, activo
  `;
  const { rows } = await pool.query(query, [activo, id]);
  return rows[0];
};

module.exports = {
  listarLineas,
  obtenerPorId,
  crearLinea,
  actualizarLinea,
  cambiarEstadoLinea,
};