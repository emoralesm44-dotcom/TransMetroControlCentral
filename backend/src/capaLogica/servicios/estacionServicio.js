const estacionDatos = require('../../capaDatos/modelos/estacionDatosModelo');

const obtenerTodas = async () => {
  return await estacionDatos.listarEstaciones();
};

const registrar = async (datos) => {
  const nombre_estacion = datos.nombre_estacion?.trim();
  const id_municipalidad = Number(datos.id_municipalidad);

  if (!nombre_estacion) {
    throw new Error('El nombre de la estación es obligatorio.');
  }
  if (!id_municipalidad) {
    throw new Error('Debe seleccionar una municipalidad.');
  }

  if (Array.isArray(datos.accesos)) {
    const accesosLimpios = datos.accesos
      .filter((a) => a.nombre_acceso && a.nombre_acceso.trim())
      .map((a) => ({
        nombre_acceso: a.nombre_acceso.trim(),
        descripcion: a.descripcion?.trim() || null,
      }));

    if (accesosLimpios.length < 1 || accesosLimpios.length > 20) {
      throw new Error('Debe agregar entre 1 y 20 accesos para la estación.');
    }

    const estacion = await estacionDatos.crearEstacionConAccesos({
      nombre_estacion,
      id_municipalidad,
      cantidad_accesos: 1,
      activo: datos.activo !== undefined ? Boolean(datos.activo) : true,
    });

    const creados = await estacionDatos.listarAccesosPorEstacion(estacion.id_estacion);
    if (creados[0]) {
      await estacionDatos.actualizarAcceso(creados[0].id_acceso, {
        nombre_acceso: accesosLimpios[0].nombre_acceso,
        descripcion: accesosLimpios[0].descripcion,
      });
    }

    for (let i = 1; i < accesosLimpios.length; i++) {
      await estacionDatos.crearAcceso({
        id_estacion: estacion.id_estacion,
        nombre_acceso: accesosLimpios[i].nombre_acceso,
        descripcion: accesosLimpios[i].descripcion,
      });
    }

    return estacion;
  }

  const cantidad_accesos = Number(datos.cantidad_accesos ?? 1);
  if (Number.isNaN(cantidad_accesos) || cantidad_accesos < 1 || cantidad_accesos > 20) {
    throw new Error('La cantidad inicial de accesos debe estar entre 1 y 20.');
  }

  return await estacionDatos.crearEstacionConAccesos({
    nombre_estacion,
    id_municipalidad,
    cantidad_accesos,
    activo: datos.activo !== undefined ? Boolean(datos.activo) : true,
  });
};

const editar = async (id, datos) => {
  const existente = await estacionDatos.obtenerPorId(id);
  if (!existente) {
    throw new Error('La estación especificada no existe.');
  }

  const nombre_estacion = datos.nombre_estacion?.trim();
  const id_municipalidad = Number(datos.id_municipalidad);

  if (!nombre_estacion || !id_municipalidad) {
    throw new Error('Nombre de estación y municipalidad son obligatorios.');
  }

  return await estacionDatos.actualizarEstacion(id, {
    nombre_estacion,
    id_municipalidad,
    activo: datos.activo !== undefined ? Boolean(datos.activo) : existente.activo,
  });
};

const cambiarEstado = async (id, activo) => {
  const existente = await estacionDatos.obtenerPorId(id);
  if (!existente) {
    throw new Error('La estación especificada no existe.');
  }
  return await estacionDatos.cambiarEstadoEstacion(id, Boolean(activo));
};

const obtenerAccesos = async (idEstacion) => {
  return await estacionDatos.listarAccesosPorEstacion(idEstacion);
};

const agregarAcceso = async (idEstacion, datos) => {
  const nombre_acceso = datos.nombre_acceso?.trim();
  const descripcion = datos.descripcion?.trim() || null;

  if (!nombre_acceso) {
    throw new Error('El nombre del acceso es obligatorio.');
  }
  const estacion = await estacionDatos.obtenerPorId(idEstacion);
  if (!estacion) {
    throw new Error('La estación no existe.');
  }
  return await estacionDatos.crearAcceso({
    id_estacion: Number(idEstacion),
    nombre_acceso,
    descripcion,
  });
};

const editarAcceso = async (idAcceso, datos) => {
  const nombre_acceso = datos.nombre_acceso?.trim();
  const descripcion = datos.descripcion?.trim() || null;

  if (!nombre_acceso) {
    throw new Error('El nombre del acceso no puede quedar vacío.');
  }
  return await estacionDatos.actualizarAcceso(Number(idAcceso), {
    nombre_acceso,
    descripcion,
  });
};

const cambiarEstadoAcceso = async (idAcceso, activo) => {
  return await estacionDatos.cambiarEstadoAcceso(Number(idAcceso), Boolean(activo));
};

module.exports = {
  obtenerTodas,
  registrar,
  editar,
  cambiarEstado,
  obtenerAccesos,
  agregarAcceso,
  editarAcceso,
  cambiarEstadoAcceso,
};