const bcrypt = require('bcryptjs');
const usuarioDatos = require('../../capaDatos/modelos/usuariosDatosModelo');
const empleadoDatos = require('../../capaDatos/modelos/empleadosDatosModelo');

const ROLES_VALIDOS = ['ADMINISTRADOR', 'SUPERVISOR', 'OPERADOR_ESTACION'];

const obtenerTodos = async () => {
  return await usuarioDatos.listarUsuarios();
};

const registrar = async (datos) => {
  const id_empleado = Number(datos.id_empleado);
  const username = datos.username?.trim().toLowerCase();
  const password = datos.password;
  const rol = datos.rol?.trim().toUpperCase();

  if (!id_empleado) {
    throw new Error('Debe seleccionar un empleado para vincular la cuenta.');
  }
  if (!username || username.length < 4 || /\s/.test(username)) {
    throw new Error('El nombre de usuario debe tener al menos 4 caracteres y no contener espacios.');
  }
  if (!password || password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres.');
  }
  if (!rol || !ROLES_VALIDOS.includes(rol)) {
    throw new Error('Seleccione un rol de sistema válido.');
  }

  const empleado = await empleadoDatos.obtenerPorId(id_empleado);
  if (!empleado) {
    throw new Error('El empleado seleccionado no existe.');
  }
  if (!empleado.activo) {
    throw new Error('No se puede crear un usuario para un empleado inactivo.');
  }

  const yaTieneUsuario = await usuarioDatos.obtenerPorEmpleado(id_empleado);
  if (yaTieneUsuario) {
    throw new Error('Este empleado ya cuenta con un usuario asignado.');
  }

  const usuarioDuplicado = await usuarioDatos.obtenerPorUsername(username);
  if (usuarioDuplicado) {
    throw new Error('El nombre de usuario ya está en uso.');
  }

  const password_hash = await bcrypt.hash(password, 10);

  return await usuarioDatos.crearUsuario({
    id_empleado,
    username,
    password_hash,
    rol,
    activo: datos.activo !== undefined ? Boolean(datos.activo) : true,
  });
};

const editar = async (id, datos) => {
  const existente = await usuarioDatos.obtenerPorId(id);
  if (!existente) {
    throw new Error('El usuario especificado no existe.');
  }

  const username = datos.username?.trim().toLowerCase();
  const rol = datos.rol?.trim().toUpperCase();
  const password = datos.password?.trim();

  if (!username || username.length < 4 || /\s/.test(username)) {
    throw new Error('El nombre de usuario debe tener al menos 4 caracteres y no contener espacios.');
  }
  if (!rol || !ROLES_VALIDOS.includes(rol)) {
    throw new Error('Seleccione un rol de sistema válido.');
  }

  const duplicado = await usuarioDatos.obtenerPorUsername(username);
  if (duplicado && duplicado.id_usuario !== Number(id)) {
    throw new Error('Otro usuario ya utiliza ese nombre de acceso.');
  }

  let password_hash = null;
  if (password) {
    if (password.length < 6) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres.');
    }
    password_hash = await bcrypt.hash(password, 10);
  }

  return await usuarioDatos.actualizarUsuario(id, {
    username,
    rol,
    activo: datos.activo !== undefined ? Boolean(datos.activo) : existente.activo,
    password_hash,
  });
};

const cambiarEstado = async (id, activo, idUsuarioActual) => {
  if (Number(id) === Number(idUsuarioActual) && !activo) {
    throw new Error('No puedes desactivar tu propio usuario administrador mientras tienes sesión activa.');
  }

  const existente = await usuarioDatos.obtenerPorId(id);
  if (!existente) {
    throw new Error('El usuario especificado no existe.');
  }

  return await usuarioDatos.cambiarEstadoUsuario(id, Boolean(activo));
};

module.exports = {
  obtenerTodos,
  registrar,
  editar,
  cambiarEstado,
};