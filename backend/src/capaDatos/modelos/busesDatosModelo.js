const pool = require('../db');

const listarBuses = async () => {
  const query = `
    SELECT b.id_bus,
           b.codigo_unidad,
           b.placa,
           b.capacidad_maxima,
           b.id_linea,
           b.id_parqueo,
           b.id_piloto,
           b.activo,
           l.nombre_linea,
           p.nombre_parqueo,
           e.nombre || ' ' || e.apellido AS nombre_piloto,
           e.dpi AS dpi_piloto
    FROM public.buses b
    LEFT JOIN public.lineas l ON b.id_linea = l.id_linea
    LEFT JOIN public.parqueos p ON b.id_parqueo = p.id_parqueo
    LEFT JOIN public.empleados e ON b.id_piloto = e.id_empleado
    ORDER BY b.id_bus ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const listarPilotosDisponibles = async (idBusExcluir = null) => {
  const query = `
    SELECT e.id_empleado,
           e.nombre,
           e.apellido,
           e.dpi
    FROM public.empleados e
    WHERE e.activo = true
      AND UPPER(e.tipo_personal) = 'PILOTO'
      AND NOT EXISTS (
        SELECT 1
        FROM public.buses b
        WHERE b.id_piloto = e.id_empleado
          AND b.activo = true
          AND ($1::int IS NULL OR b.id_bus <> $1::int)
      )
    ORDER BY e.nombre ASC, e.apellido ASC
  `;
  const { rows } = await pool.query(query, [idBusExcluir]);
  return rows;
};

const obtenerPorId = async (id) => {
  const query = `
    SELECT id_bus, codigo_unidad, placa, capacidad_maxima, id_linea, id_parqueo, id_piloto, activo
    FROM public.buses
    WHERE id_bus = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const verificarPilotoEnOtroBus = async (idPiloto, idBusExcluir = null) => {
  const query = `
    SELECT id_bus, codigo_unidad
    FROM public.buses
    WHERE id_piloto = $1
      AND activo = true
      AND ($2::int IS NULL OR id_bus <> $2::int)
  `;
  const { rows } = await pool.query(query, [idPiloto, idBusExcluir]);
  return rows[0];
};

const verificarEmpleadoPiloto = async (idPiloto) => {
  const query = `
    SELECT id_empleado, tipo_personal, activo
    FROM public.empleados
    WHERE id_empleado = $1
  `;
  const { rows } = await pool.query(query, [idPiloto]);
  return rows[0];
};

const crearBus = async ({
  codigo_unidad,
  placa,
  capacidad_maxima,
  id_linea,
  id_parqueo,
  id_piloto,
  activo,
}) => {
  const query = `
    INSERT INTO public.buses (
      codigo_unidad, placa, capacidad_maxima, id_linea, id_parqueo, id_piloto, activo
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [
    codigo_unidad,
    placa || null,
    capacidad_maxima,
    id_linea || null,
    id_parqueo || null,
    id_piloto || null,
    activo ?? true,
  ]);
  return rows[0];
};

const actualizarBus = async (
  id,
  { codigo_unidad, placa, capacidad_maxima, id_linea, id_parqueo, id_piloto, activo }
) => {
  const query = `
    UPDATE public.buses
    SET codigo_unidad = $1,
        placa = $2,
        capacidad_maxima = $3,
        id_linea = $4,
        id_parqueo = $5,
        id_piloto = $6,
        activo = $7
    WHERE id_bus = $8
    RETURNING *
  `;
  const { rows } = await pool.query(query, [
    codigo_unidad,
    placa || null,
    capacidad_maxima,
    id_linea || null,
    id_parqueo || null,
    id_piloto || null,
    activo,
    id,
  ]);
  return rows[0];
};

const cambiarEstadoBus = async (id, activo) => {
  const query = `
    UPDATE public.buses
    SET activo = $1,
        id_piloto = CASE WHEN $1 = false THEN NULL ELSE id_piloto END,
        id_linea = CASE WHEN $1 = false THEN NULL ELSE id_linea END
    WHERE id_bus = $2
    RETURNING id_bus, codigo_unidad, activo
  `;
  const { rows } = await pool.query(query, [activo, id]);
  return rows[0];
};

module.exports = {
  listarBuses,
  listarPilotosDisponibles,
  obtenerPorId,
  verificarPilotoEnOtroBus,
  verificarEmpleadoPiloto,
  crearBus,
  actualizarBus,
  cambiarEstadoBus,
};