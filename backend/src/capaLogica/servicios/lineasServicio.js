const lineaDatos = require('../../capaDatos/modelos/lineaDatosModelo');

const obtenerTodas = async () => {
  return await lineaDatos.listarLineas();
};

const registrar = async (datos) => {
  const codigo_linea = datos.codigo_linea?.trim().toUpperCase();
  const nombre_linea = datos.nombre_linea?.trim();
  const descripcion = datos.descripcion?.trim() || null;
  const id_municipalidad = Number(datos.id_municipalidad);

  if (!codigo_linea) {
    throw new Error('El código de línea/ruta es obligatorio.');
  }
  if (!nombre_linea) {
    throw new Error('El nombre de la línea es obligatorio.');
  }
  if (!id_municipalidad) {
    throw new Error('Debe seleccionar una municipalidad.');
  }

  return await lineaDatos.crearLinea({
    codigo_linea,
    nombre_linea,
    descripcion,
    id_municipalidad,
    activo: datos.activo !== undefined ? Boolean(datos.activo) : true,
  });
};

const editar = async (id, datos) => {
  const existente = await lineaDatos.obtenerPorId(id);
  if (!existente) {
    throw new Error('La línea especificada no existe.');
  }

  const codigo_linea = datos.codigo_linea?.trim().toUpperCase();
  const nombre_linea = datos.nombre_linea?.trim();
  const descripcion = datos.descripcion?.trim() || null;
  const id_municipalidad = Number(datos.id_municipalidad);

  if (!codigo_linea || !nombre_linea || !id_municipalidad) {
    throw new Error('Código, nombre de línea y municipalidad son obligatorios.');
  }

  return await lineaDatos.actualizarLinea(id, {
    codigo_linea,
    nombre_linea,
    descripcion,
    id_municipalidad,
    activo: datos.activo !== undefined ? Boolean(datos.activo) : existente.activo,
  });
};

const cambiarEstado = async (id, activo) => {
  const existente = await lineaDatos.obtenerPorId(id);
  if (!existente) {
    throw new Error('La línea especificada no existe.');
  }
  return await lineaDatos.cambiarEstadoLinea(id, Boolean(activo));
};

module.exports = {
  obtenerTodas,
  registrar,
  editar,
  cambiarEstado,
};