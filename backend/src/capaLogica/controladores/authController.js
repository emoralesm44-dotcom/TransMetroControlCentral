const authServicio = require('../servicios/authServicio');

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

    const accessToken = authServicio.generarTokenAcceso(usuario);

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000
    });

    return res.status(200).json({
      mensaje: 'Autenticación exitosa',
      usuario: {
        nombre_completo: `${usuario.nombre} ${usuario.apellido}`,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('CRITICAL AUTH ERROR:', error.message);
    return res.status(500).json({ error: 'Error procesando la solicitud de acceso.' });
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ mensaje: 'Sesión finalizada de manera segura.' });
};

module.exports = { loginSeguro, logout };