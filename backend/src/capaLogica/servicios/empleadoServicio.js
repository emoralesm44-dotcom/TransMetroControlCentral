const empleadoDatos = require('../../capaDatos/modelos/empleadosDatosModel');

const TIPOS_VALIDOS = ['ADMINISTRADOR', 'SUPERVISOR', 'PILOTO', 'OPERADOR_ESTACION', 'GUARDIA'];

const validarDatos = (datos) => {
  const nombre = datos.nombre?.trim();
  const apellido = datos.apellido?.trim();
  const dpi = datos.dpi?.trim();
  const tipo_personal = datos.tipo_personal?.trim().toUpperCase();

  if (!nombre || !apellido) {
    throw new Error('El nombre y el apellido son obligatorios.');
  }
  if (!dpi || !/^\d{13}$/.test(dpi)) {
    throw new Error('El DPI debe contener exactamente 13 dígitos numéricos.');
  }
  if (!tipo_personal || !TIPOS_VALIDOS.includes(tipo_personal)) {
    throw new Error('Seleccione un tipo de personal válido.');
  }

  return {
    nombre,
    apellido,
    dpi,
    telefono: datos.telefono?.trim() || null,
    direccion_residencia: datos.direccion_residencia?.trim() || null,
    historial_educativo: datos.historial_educativo?.trim() || null,
    tipo_personal,
    fecha_contratacion: datos.fecha_contratacion || null,
    activo: datos.activo !== undefined ? Boolean(datos.activo) : true,
  };
};

const obtenerTodos = async () => {
  return await empleadoDatos.listarEmpleados();
};

const registrar = async (datos) => {
  const limpio = validarDatos(datos);

  const duplicado = await empleadoDatos.obtenerPorDpi(limpio.dpi);
  if (duplicado) {
    throw new Error('Ya existe un empleado registrado con ese número de DPI.');
  }

  return await empleadoDatos.crearEmpleado(limpio);
};

const editar = async (id, datos) => {
  const existente = await empleadoDatos.obtenerPorId(id);
  if (!existente) {
    throw new Error('El empleado especificado no existe.');
  }

  const limpio = validarDatos(datos);

  const duplicado = await empleadoDatos.obtenerPorDpi(limpio.dpi);
  if (duplicado && duplicado.id_empleado !== Number(id)) {
    throw new Error('Otro empleado ya está registrado con ese número de DPI.');
  }

  return await empleadoDatos.actualizarEmpleado(id, limpio);
};

const cambiarEstado = async (id, activo) => {
  const existente = await empleadoDatos.obtenerPorId(id);
  if (!existente) {
    throw new Error('El empleado especificado no existe.');
  }

  return await empleadoDatos.cambiarEstadoEmpleado(id, Boolean(activo));
};

module.exports = {
  obtenerTodos,
  registrar,
  editar,
  cambiarEstado,
};