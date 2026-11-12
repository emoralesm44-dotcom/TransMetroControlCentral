const jwt = require('jsonwebtoken');
const authServicio = require('../servicios/authServicio');

const ROLES_VALIDOS = ['ADMINISTRADOR', 'SUPERVISOR', 'PILOTO', 'OPERADOR_ESTACION'];

const loginSeguro = async (req, res) => {
  const { nombre_usuario, contrasenia } = req.body;

  if (!nombre_usuario || !contrasenia) {
    return res.status(400).json({ error: 'Credenciales inválidas.' });
  }

  try {
    const usuario = await authServicio.validarCredenciales(nombre_usuario, contrasenia);

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    if (!ROLES_VALIDOS.includes(usuario.rol)) {
      return res.status(403).json({ error: 'Acceso denegado: rol no autorizado.' });
    }

    const accessToken = authServicio.generarTokenAcceso(usuario);

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      mensaje: 'Autenticación exitosa',
      usuario: {
        nombre_completo: `${usuario.nombre} ${usuario.apellido}`,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error('CRITICAL AUTH ERROR:', error.message);
    return res.status(500).json({ error: 'Error procesando la solicitud de acceso.' });
  }
};

const obtenerPerfil = (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(200).json({ usuario: null });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'transmetro-auth',
      audience: 'transmetro-web',
    });

    if (!ROLES_VALIDOS.includes(decoded.rol)) {
      res.clearCookie('token');
      return res.status(200).json({ usuario: null });
    }

    return res.status(200).json({
      usuario: {
        nombre_completo: decoded.nombre_completo || `${decoded.nombre} ${decoded.apellido}`,
        rol: decoded.rol,
      },
    });
  } catch {
    res.clearCookie('token');
    return res.status(200).json({ usuario: null });
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ mensaje: 'Sesión finalizada de manera segura.' });
};

module.exports = { loginSeguro, obtenerPerfil, logout };