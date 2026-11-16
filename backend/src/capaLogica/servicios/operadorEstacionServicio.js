const operadorDatos = require('../../capaDatos/modelos/operadorEstacionDatosModelo');

const obtenerTodo = async () => {
  const [asignaciones, operadoresDisponibles, estacionesDisponibles] = await Promise.all([
    operadorDatos.listarAsignaciones(),
    operadorDatos.listarOperadoresDisponibles(),
    operadorDatos.listarEstacionesDisponibles(),
  ]);
  return { asignaciones, operadoresDisponibles, estacionesDisponibles };
};

const asignar = async (datos) => {
  const id_empleado_operador = Number(datos.id_empleado_operador);
  const id_estacion = Number(datos.id_estacion);

  if (!id_empleado_operador || !id_estacion) {
    throw new Error('Debe seleccionar un operador y una estación.');
  }

  const registro = await operadorDatos.verificarEmpleadoOperadorConUsuario(id_empleado_operador);
  if (!registro || !registro.empleado_activo || registro.tipo_personal?.toUpperCase() !== 'OPERADOR_ESTACION') {
    throw new Error('El empleado seleccionado no es un Operador de Estación activo.');
  }

  if (!registro.id_usuario || !registro.usuario_activo || registro.rol?.toUpperCase() !== 'OPERADOR_ESTACION') {
    throw new Error('El operador debe contar con un usuario activo en el sistema con rol OPERADOR_ESTACION antes de asignarlo.');
  }

  const yaAsignado = await operadorDatos.verificarOperadorOcupado(id_empleado_operador);
  if (yaAsignado) {
    throw new Error(`El operador ya está asignado a la estación "${yaAsignado.nombre_estacion}".`);
  }

  const estacionConOperador = await operadorDatos.verificarEstacionOcupada(id_estacion);
  if (estacionConOperador) {
    throw new Error(`La estación ya tiene asignado al operador "${estacionConOperador.nombre_operador}".`);
  }

  try {
    return await operadorDatos.crearAsignacion({ id_empleado_operador, id_estacion });
  } catch (err) {
    if (err.code === '23505') {
      throw new Error('El operador o la estación ya cuentan con una asignación activa.');
    }
    throw err;
  }
};

const liberar = async (id) => {
  const res = await operadorDatos.liberarAsignacion(Number(id));
  if (!res) {
    throw new Error('La asignación no existe.');
  }
  return res;
};

module.exports = {
  obtenerTodo,
  asignar,
  liberar,
};