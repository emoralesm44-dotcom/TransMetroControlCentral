const municipalidadDatos = require('../../capaDatos/modelos/municipalidaDatosModelo');

const obtenerTodas = async () => {
  return await municipalidadDatos.listarMunicipalidades();
};

const registrar = async (datos) => {
  const nombre = datos.nombre?.trim();
  const departamento = datos.departamento?.trim() || 'Guatemala';

  if (!nombre) {
    throw new Error('El nombre de la municipalidad es obligatorio.');
  }

  return await municipalidadDatos.crearMunicipalidad({
    nombre,
    departamento,
    activo: datos.activo !== undefined ? Boolean(datos.activo) : true,
  });
};

const editar = async (id, datos) => {
  const existente = await municipalidadDatos.obtenerPorId(id);
  if (!existente) {
    throw new Error('La municipalidad  no existe.');
  }

  const nombre = datos.nombre?.trim();
  const departamento = datos.departamento?.trim() || 'Guatemala';

  if (!nombre) {
    throw new Error('El nombre de la municipalidad es obligatorio.');
  }

  return await municipalidadDatos.actualizarMunicipalidad(id, {
    nombre,
    departamento,
    activo: datos.activo !== undefined ? Boolean(datos.activo) : existente.activo,
  });
};

const cambiarEstado = async (id, activo) => {
  const existente = await municipalidadDatos.obtenerPorId(id);
  if (!existente) {
    throw new Error('La municipalidad  no existe.');
  }

  return await municipalidadDatos.cambiarEstadoMunicipalidad(id, Boolean(activo));
};

module.exports = {
  obtenerTodas,
  registrar,
  editar,
  cambiarEstado,
};