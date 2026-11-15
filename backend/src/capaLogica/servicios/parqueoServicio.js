const parqueoDatos = require('../../capaDatos/modelos/parqueoDatosModelo');


const obtenerTodos = async () => {
  return await parqueoDatos.listarParqueos();
};

const validarDatos = (datos) => {
  const nombre_parqueo = datos.nombre_parqueo?.trim();
  const id_estacion = Number(datos.id_estacion);
  const capacidad_unidades = Number(datos.capacidad_unidades);
  const descripcion = datos.descripcion?.trim() || null;

  if (!nombre_parqueo) {
    throw new Error('El nombre del parqueo es obligatorio.');
  }
  if (!id_estacion) {
    throw new Error('Debe seleccionar una estación.');
  }
  if (Number.isNaN(capacidad_unidades) || capacidad_unidades < 1) {
    throw new Error('La capacidad de unidades (buses) debe ser mayor o igual a 1.');
  }

  return {
    nombre_parqueo,
    id_estacion,
    capacidad_unidades,
    descripcion,
  };
};

const registrar = async (datos) => {
  const limpio = validarDatos(datos);
  return await parqueoDatos.crearParqueo({
    ...limpio,
    activo: datos.activo !== undefined ? Boolean(datos.activo) : true,
  });
};

const editar = async (id, datos) => {
  const existente = await parqueoDatos.obtenerPorId(id);
  if (!existente) {
    throw new Error('El parqueo especificado no existe.');
  }
  const limpio = validarDatos(datos);
  return await parqueoDatos.actualizarParqueo(id, {
    ...limpio,
    activo: datos.activo !== undefined ? Boolean(datos.activo) : existente.activo,
  });
};

const cambiarEstado = async (id, activo) => {
  const existente = await parqueoDatos.obtenerPorId(id);
  if (!existente) {
    throw new Error('El parqueo especificado no existe.');
  }
  return await parqueoDatos.cambiarEstadoParqueo(id, Boolean(activo));
};

module.exports = {
  obtenerTodos,
  registrar,
  editar,
  cambiarEstado,
};