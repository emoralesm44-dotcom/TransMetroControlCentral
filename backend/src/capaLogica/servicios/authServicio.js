// Importación de librerías 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioModelo = require('../../capaDatos/modelos/usuarioModelo');

// Hash para igualar tiempos de respuesta si el usuario no existe 
const DUMMY_HASH = '$2a$12$eImiTXuWVxfM37uY4JANjO5E/153.9p2b/a0Kq7bQzZJ8rQvC4P1S';

// Servicio de lógica de autenticación de usuarios Verifica existencia, estado y contraseña del usuario
const authServicio = {
  validarCredenciales: async (nombreUsuario, contrasenia) => {
    const usuario = await usuarioModelo.buscarParaAutenticacion(nombreUsuario);

    if (!usuario) {
      await bcrypt.compare(contrasenia, DUMMY_HASH);
      return null;
    }

    if (!usuario.usuario_activo || !usuario.empleado_activo) {
      return null;
    }

    const passwordValida = await bcrypt.compare(contrasenia, usuario.contrasenia);
    if (!passwordValida) {
      return null;
    }

    await usuarioModelo.actualizarUltimoAcceso(usuario.id_usuario);

    return usuario;
  },

  // Genera y firma el token JWT con expiración y datos de sesión
  generarTokenAcceso: (usuario) => {
    const tokenPayload = {
      sub: usuario.id_usuario,
      emp: usuario.id_empleado,
      rol: usuario.rol
    };

    return jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '2h',
      issuer: 'transmetro-auth',
      audience: 'transmetro-web'
    });
  }
};

module.exports = authServicio;