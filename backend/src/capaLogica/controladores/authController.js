const jwt = require('jsonwebtoken');
const authServicio = require('../servicios/authServicio');

// Constantes de roles, verificación JWT 
const ROLES_VALIDOS = new Set(['ADMINISTRADOR', 'SUPERVISOR', 'OPERADOR_ESTACION']);
const OPCIONES_JWT = { issuer: 'transmetro-auth', audience: 'transmetro-web' };
const DURACION_COOKIE_MS = 2 * 60 * 60 * 1000;
const OPCIONES_COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

// Helpers internos para formateo de usuario y limpieza de sesión
const limpiarCookieToken = (res) => res.clearCookie('token', OPCIONES_COOKIE_BASE);
const formatearUsuario = (datos) => ({
  nombre_completo: datos.nombre_completo || `${datos.nombre ?? ''} ${datos.apellido ?? ''}`.trim(),
  rol: datos.rol,
});

// Controlador de inicio de sesión: valida credenciales, rol 
const loginSeguro = async (req, res) => {
  const { nombre_usuario, contrasenia } = req.body ?? {};

  if (!nombre_usuario || !contrasenia) {
    return res.status(400).json({ error: 'Credenciales inválidas.' });
  }

  try {
    const usuario = await authServicio.validarCredenciales(nombre_usuario, contrasenia);

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    if (!ROLES_VALIDOS.has(usuario.rol)) {
      return res.status(403).json({ error: 'Acceso denegado: rol no autorizado.' });
    }

    const accessToken = authServicio.generarTokenAcceso(usuario);

    res.cookie('token', accessToken, { ...OPCIONES_COOKIE_BASE, maxAge: DURACION_COOKIE_MS });

    return res.status(200).json({
      mensaje: 'Autenticación exitosa',
      usuario: formatearUsuario(usuario),
    });
  } catch (error) {
    console.error('CRITICAL AUTH ERROR:', error.message);
    return res.status(500).json({ error: 'Error procesando la solicitud de acceso.' });
  }
};

// Controlador para consultar el usuario autenticado desde la cookie JWT
const obtenerPerfil = (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(200).json({ usuario: null });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, OPCIONES_JWT);

    if (!ROLES_VALIDOS.has(decoded.rol)) {
      limpiarCookieToken(res);
      return res.status(200).json({ usuario: null });
    }

    return res.status(200).json({ usuario: formatearUsuario(decoded) });
  } catch {
    limpiarCookieToken(res);
    return res.status(200).json({ usuario: null });
  }
};

// Controlador para cerrar sesión eliminando la cookie de autenticación
const logout = (req, res) => {
  limpiarCookieToken(res);
  return res.status(200).json({ mensaje: 'Sesión finalizada de manera segura.' });
};


module.exports = { loginSeguro, obtenerPerfil, logout };