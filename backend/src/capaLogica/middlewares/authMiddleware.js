const jwt = require('jsonwebtoken');

// Middleware que valida el token JWT almacenado en cookies y adjunta los datos del usuario a la petición
const verificarAutenticacion = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'No autorizado. Inicie sesión nuevamente.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'transmetro-auth',
      audience: 'transmetro-web'
    });
    req.usuario = decoded;
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.status(401).json({ error: 'Sesión expirada' });
  }
};

// Middleware que valida si el rol del usuario autenticado está dentro de los permitidos
const requerirRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'Acceso denegado , permisos insuficientes.' });
    }
    next();
  };
};

module.exports = { verificarAutenticacion, requerirRol };