const busDatos = require('../../capaDatos/modelos/busesDatosModelo');

const obtenerTodos = async () => {
  return await busDatos.listarBuses();
};

const obtenerPilotosDisponibles = async (idBusExcluir = null) => {
  return await busDatos.listarPilotosDisponibles(idBusExcluir ? Number(idBusExcluir) : null);
};

const validarDatos = async (datos, idBusExcluir = null) => {
  const codigo_unidad = datos.codigo_unidad?.trim().toUpperCase();
  const placa = datos.placa?.trim().toUpperCase() || null;
  const capacidad_maxima = Number(datos.capacidad_maxima);
  const id_linea = datos.id_linea ? Number(datos.id_linea) : null;
  const id_parqueo = datos.id_parqueo ? Number(datos.id_parqueo) : null;
  const id_piloto = datos.id_piloto ? Number(datos.id_piloto) : null;

  if (!codigo_unidad) {
    throw new Error('El código de unidad es obligatorio.');
  }
  if (!placa) {
    throw new Error('La placa del bus es obligatoria.');
  }
  if (Number.isNaN(capacidad_maxima) || capacidad_maxima < 1) {
    throw new Error('La capacidad máxima de pasajeros debe ser mayor o igual a 1.');
  }

  if (id_piloto) {
    const empleado = await busDatos.verificarEmpleadoPiloto(id_piloto);
    if (!empleado || !empleado.activo || empleado.tipo_personal?.toUpperCase() !== 'PILOTO') {
      throw new Error('El empleado seleccionado no es un piloto activo válido.');
    }

    const busOcupado = await busDatos.verificarPilotoEnOtroBus(id_piloto, idBusExcluir);
    if (busOcupado) {
      throw new Error(`El piloto seleccionado ya está asignado a la unidad "${busOcupado.codigo_unidad}".`);
    }
  }

  return {
    codigo_unidad,
    placa,
    capacidad_maxima,
    id_linea,
    id_parqueo,
    id_piloto,
  };
};

const manejarErrorUnicidad = (err) => {
  if (err.code === '23505') {
    if (err.constraint?.includes('codigo_unidad')) {
      throw new Error('Ya existe un bus con ese código de unidad.');
    }
    if (err.constraint?.includes('placa')) {
      throw new Error('Ya existe un bus registrado con esa placa.');
    }
    if (err.constraint?.includes('piloto')) {
      throw new Error('El piloto seleccionado ya está asignado a otro bus.');
    }
  }
  throw err;
};

const registrar = async (datos) => {
  const limpio = await validarDatos(datos, null);
  try {
    return await busDatos.crearBus({
      ...limpio,
      activo: datos.activo !== undefined ? Boolean(datos.activo) : true,
    });
  } catch (err) {
    manejarErrorUnicidad(err);
  }
};

const editar = async (id, datos) => {
  const existente = await busDatos.obtenerPorId(id);
  if (!existente) {
    throw new Error('El bus especificado no existe.');
  }
  const limpio = await validarDatos(datos, Number(id));
  try {
    return await busDatos.actualizarBus(Number(id), {
      ...limpio,
      activo: datos.activo !== undefined ? Boolean(datos.activo) : existente.activo,
    });
  } catch (err) {
    manejarErrorUnicidad(err);
  }
};

const cambiarEstado = async (id, activo) => {
  const existente = await busDatos.obtenerPorId(id);
  if (!existente) {
    throw new Error('El bus especificado no existe.');
  }
  return await busDatos.cambiarEstadoBus(Number(id), Boolean(activo));
};

module.exports = {
  obtenerTodos,
  obtenerPilotosDisponibles,
  registrar,
  editar,
  cambiarEstado,
};