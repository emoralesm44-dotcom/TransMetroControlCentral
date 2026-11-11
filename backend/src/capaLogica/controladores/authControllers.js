const pool = require('../../capaDatos/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const loginSeguro = async (req, res) => {
  const { nombre_usuario, contrasenia } = req.body;

  if (!nombre_usuario || !contrasenia) {
    return res.status(400).json({ error: 'Credenciales inválidas.' });
  }

  try {
    const query = `
      SELECT u.id_usuario, u.contrasenia, u.rol, u.activo AS usuario_activo,
             e.id_empleado, e.nombre, e.apellido, e.activo AS empleado_activo
      FROM usuarios u
      INNER JOIN empleados e ON u.id_empleado = e.id_empleado
      WHERE u.nombre_usuario = $1;
    `;
    
    const result = await pool.query(query, [nombre_usuario]);

    if (result.rows.length === 0) {
      await bcrypt.compare(contrasenia, '$2a$12$eImiTXuWVxfM37uY4JANjO5E/153.9p2b/a0Kq7bQzZJ8rQvC4P1S');
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const usuario = result.rows[0];

    if (!usuario.usuario_activo || !usuario.empleado_activo) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const passwordValida = await bcrypt.compare(contrasenia, usuario.contrasenia);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const tokenPayload = {
      sub: usuario.id_usuario,
      emp: usuario.id_empleado,
      rol: usuario.rol
    };

    const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '2h',
      issuer: 'transmetro-auth',
      audience: 'transmetro-web'
    });

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