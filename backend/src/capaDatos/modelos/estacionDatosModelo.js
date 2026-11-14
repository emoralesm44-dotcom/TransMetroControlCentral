const pool = require('../db');

const listarEstaciones = async () => {
  const query = `
    SELECT e.id_estacion,
           e.nombre_estacion,
           e.id_municipalidad,
           e.activo,
           m.nombre AS nombre_municipalidad,
           COUNT(a.id_acceso) FILTER (WHERE a.activo = true)::int AS total_accesos
    FROM public.estaciones e
    INNER JOIN public.municipalidades m ON e.id_municipalidad = m.id_municipalidad
    LEFT JOIN public.accesos a ON e.id_estacion = a.id_estacion
    GROUP BY e.id_estacion, m.nombre
    ORDER BY e.id_estacion ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const obtenerPorId = async (id) => {
  const query = `
    SELECT id_estacion, nombre_estacion, id_municipalidad, activo
    FROM public.estaciones
    WHERE id_estacion = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const crearEstacionConAccesos = async ({ nombre_estacion, id_municipalidad, cantidad_accesos, activo }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const resEst = await client.query(
      `INSERT INTO public.estaciones (nombre_estacion, id_municipalidad, activo)
       VALUES ($1, $2, $3)
       RETURNING id_estacion, nombre_estacion, id_municipalidad, activo`,
      [nombre_estacion, id_municipalidad, activo ?? true]
    );
    const estacion = resEst.rows[0];

    const total = Number(cantidad_accesos) || 0;
    for (let i = 1; i <= total; i++) {
      await client.query(
        `INSERT INTO public.accesos (id_estacion, nombre_acceso, descripcion, activo)
         VALUES ($1, $2, NULL, true)`,
        [estacion.id_estacion, `Acceso ${i}`]
      );
    }

    await client.query('COMMIT');
    return estacion;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const actualizarEstacion = async (id, { nombre_estacion, id_municipalidad, activo }) => {
  const query = `
    UPDATE public.estaciones
    SET nombre_estacion = $1, id_municipalidad = $2, activo = $3
    WHERE id_estacion = $4
    RETURNING id_estacion, nombre_estacion, id_municipalidad, activo
  `;
  const { rows } = await pool.query(query, [nombre_estacion, id_municipalidad, activo, id]);
  return rows[0];
};

const cambiarEstadoEstacion = async (id, activo) => {
  const query = `
    UPDATE public.estaciones
    SET activo = $1
    WHERE id_estacion = $2
    RETURNING id_estacion, nombre_estacion, activo
  `;
  const { rows } = await pool.query(query, [activo, id]);
  return rows[0];
};

const listarAccesosPorEstacion = async (idEstacion) => {
  const query = `
    SELECT id_acceso, id_estacion, nombre_acceso, descripcion, activo
    FROM public.accesos
    WHERE id_estacion = $1
    ORDER BY id_acceso ASC
  `;
  const { rows } = await pool.query(query, [idEstacion]);
  return rows;
};

const crearAcceso = async ({ id_estacion, nombre_acceso, descripcion }) => {
  const query = `
    INSERT INTO public.accesos (id_estacion, nombre_acceso, descripcion, activo)
    VALUES ($1, $2, $3, true)
    RETURNING id_acceso, id_estacion, nombre_acceso, descripcion, activo
  `;
  const { rows } = await pool.query(query, [id_estacion, nombre_acceso, descripcion || null]);
  return rows[0];
};

const actualizarAcceso = async (idAcceso, { nombre_acceso, descripcion }) => {
  const query = `
    UPDATE public.accesos
    SET nombre_acceso = $1,
        descripcion = $2
    WHERE id_acceso = $3
    RETURNING id_acceso, id_estacion, nombre_acceso, descripcion, activo
  `;
  const { rows } = await pool.query(query, [nombre_acceso, descripcion || null, idAcceso]);
  return rows[0];
};

const cambiarEstadoAcceso = async (idAcceso, activo) => {
  const query = `
    UPDATE public.accesos
    SET activo = $1
    WHERE id_acceso = $2
    RETURNING id_acceso, id_estacion, nombre_acceso, descripcion, activo
  `;
  const { rows } = await pool.query(query, [activo, idAcceso]);
  return rows[0];
};

module.exports = {
  listarEstaciones,
  obtenerPorId,
  crearEstacionConAccesos,
  actualizarEstacion,
  cambiarEstadoEstacion,
  listarAccesosPorEstacion,
  crearAcceso,
  actualizarAcceso,
  cambiarEstadoAcceso,
};