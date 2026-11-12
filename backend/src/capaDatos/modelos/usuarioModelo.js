const pool = require('../db');

const usuarioModelo = {
  buscarParaAutenticacion: async (nombreUsuario) => {
    const query = `
      SELECT u.id_usuario, u.contrasenia, u.rol, u.activo AS usuario_activo,
             e.id_empleado, e.nombre, e.apellido, e.activo AS empleado_activo
      FROM usuarios u
      INNER JOIN empleados e ON u.id_empleado = e.id_empleado
      WHERE u.nombre_usuario = $1;
    `;
    const result = await pool.query(query, [nombreUsuario]);
    return result.rows[0] || null;
  }
};

module.exports = usuarioModelo;