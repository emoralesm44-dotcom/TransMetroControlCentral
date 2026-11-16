const pool = require('../db');

const listarPorLinea = async (idLinea) => {
  const query = `
    SELECT le.id_linea_estacion,
           le.id_linea,
           le.id_estacion,
           le.orden_secuencia,
           le.distancia_siguiente_km,
           le.activo,
           e.nombre_estacion,
           m.nombre AS nombre_municipalidad
    FROM public.linea_estaciones le
    INNER JOIN public.estaciones e ON le.id_estacion = e.id_estacion
    INNER JOIN public.municipalidades m ON e.id_municipalidad = m.id_municipalidad
    WHERE le.id_linea = $1
    ORDER BY le.orden_secuencia ASC
  `;
  const { rows } = await pool.query(query, [idLinea]);
  return rows;
};

const listarEstacionesDisponibles = async (idLinea) => {
  const query = `
    SELECT e.id_estacion,
           e.nombre_estacion,
           m.nombre AS nombre_municipalidad
    FROM public.estaciones e
    INNER JOIN public.municipalidades m ON e.id_municipalidad = m.id_municipalidad
    WHERE e.activo = true
      AND NOT EXISTS (
        SELECT 1
        FROM public.linea_estaciones le
        WHERE le.id_linea = $1
          AND le.id_estacion = e.id_estacion
      )
    ORDER BY e.nombre_estacion ASC
  `;
  const { rows } = await pool.query(query, [idLinea]);
  return rows;
};

const guardarRutaCompleta = async (idLinea, estacionesOrdenadas) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM public.linea_estaciones WHERE id_linea = $1', [idLinea]);

    let distanciaTotal = 0;

    for (let i = 0; i < estacionesOrdenadas.length; i++) {
      const item = estacionesOrdenadas[i];
      const orden = i + 1;
      const esUltima = i === estacionesOrdenadas.length - 1;
      const distanciaTramo = esUltima ? 0 : Number(item.distancia_siguiente_km) || 0;

      distanciaTotal += distanciaTramo;

      await client.query(
        `INSERT INTO public.linea_estaciones (
          id_linea, id_estacion, orden_secuencia, distancia_siguiente_km, activo
        )
        VALUES ($1, $2, $3, $4, true)`,
        [idLinea, Number(item.id_estacion), orden, distanciaTramo.toFixed(2)]
      );
    }

    const resLinea = await client.query(
      `UPDATE public.lineas
       SET distancia_total_km = $1
       WHERE id_linea = $2
       RETURNING id_linea, nombre_linea, distancia_total_km`,
      [distanciaTotal.toFixed(2), idLinea]
    );

    await client.query('COMMIT');
    return resLinea.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  listarPorLinea,
  listarEstacionesDisponibles,
  guardarRutaCompleta,
};