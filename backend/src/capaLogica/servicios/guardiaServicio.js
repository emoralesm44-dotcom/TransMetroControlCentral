const guardiaDatos = require('../../capaDatos/modelos/guardiaDatosModelo');

const obtenerDatosModulo = async () => {
  const [asignaciones, disponibles, accesos] = await Promise.all([
    guardiaDatos.listarAsignacionesActivas(),
    guardiaDatos.listarGuardiasDisponibles(),
    guardiaDatos.listarAccesosActivos(),
  ]);
  return { asignaciones, disponibles, accesos };
};

const asignar = async (datos) => {
  const id_acceso = Number(datos.id_acceso);
  const id_empleado_guardia = Number(datos.id_empleado_guardia);

  if (!id_acceso || !id_empleado_guardia) {
    throw new Error('Debe seleccionar un acceso de estación y un guardia disponible.');
  }

  const empleado = await guardiaDatos.verificarGuardiaValido(id_empleado_guardia);
  if (!empleado || !empleado.activo || empleado.tipo_personal?.toUpperCase() !== 'GUARDIA') {
    throw new Error('El empleado seleccionado no es un guardia activo válido.');
  }

  const acceso = await guardiaDatos.verificarAccesoValido(id_acceso);
  if (!acceso || !acceso.acceso_activo || !acceso.estacion_activo) {
    throw new Error('El acceso o la estación seleccionada se encuentra inactiva.');
  }

  const asignacionActual = await guardiaDatos.obtenerAsignacionActivaPorGuardia(id_empleado_guardia);
  if (asignacionActual) {
    throw new Error(
      `El guardia ya está asignado a "${asignacionActual.nombre_acceso}" en la estación "${asignacionActual.nombre_estacion}".`
    );
  }

  try {
    return await guardiaDatos.crearAsignacion({ id_acceso, id_empleado_guardia });
  } catch (err) {
    if (err.code === '23505') {
      throw new Error('Este guardia ya cuenta con una asignación activa en otro acceso.');
    }
    throw err;
  }
};

const liberar = async (id) => {
  return await guardiaDatos.liberarAsignacion(Number(id));
};

module.exports = {
  obtenerDatosModulo,
  asignar,
  liberar,
};