const pool = require('../db'); 

const listarMunicipalidades = async () => {
  const query = `
    SELECT id_municipalidad, nombre, departamento, activo
    FROM public.municipalidades
    ORDER BY id_municipalidad ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const obtenerPorId = async (id) => {
  const query = `
    SELECT id_municipalidad, nombre, departamento, activo
    FROM public.municipalidades
    WHERE id_municipalidad = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const crearMunicipalidad = async ({ nombre, departamento, activo }) => {
  const query = `
    INSERT INTO public.municipalidades (nombre, departamento, activo)
    VALUES ($1, $2, $3)
    RETURNING id_municipalidad, nombre, departamento, activo
  `;
  const valores = [nombre, departamento || 'Guatemala', activo ?? true];
  const { rows } = await pool.query(query, valores);
  return rows[0];
};

const actualizarMunicipalidad = async (id, { nombre, departamento, activo }) => {
  const query = `
    UPDATE public.municipalidades
    SET nombre = $1, departamento = $2, activo = $3
    WHERE id_municipalidad = $4
    RETURNING id_municipalidad, nombre, departamento, activo
  `;
  const valores = [nombre, departamento, activo, id];
  const { rows } = await pool.query(query, valores);
  return rows[0];
};

const cambiarEstadoMunicipalidad = async (id, activo) => {
  const query = `
    UPDATE public.municipalidades
    SET activo = $1
    WHERE id_municipalidad = $2
    RETURNING id_municipalidad, nombre, departamento, activo
  `;
  const { rows } = await pool.query(query, [activo, id]);
  return rows[0];
};

module.exports = {
  listarMunicipalidades,
  obtenerPorId,
  crearMunicipalidad,
  actualizarMunicipalidad,
  cambiarEstadoMunicipalidad,
};