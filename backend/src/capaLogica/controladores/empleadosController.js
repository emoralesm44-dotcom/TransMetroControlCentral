const empleadoLogica = require('../servicios/empleadoServicio');

const listar = async (req, res) => {
  try {
    const lista = await empleadoLogica.obtenerTodos();
    res.json({ empleados: lista });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al obtener el personal.' });
  }
};

const crear = async (req, res) => {
  try {
    const nuevo = await empleadoLogica.registrar(req.body);
    res.status(201).json({ mensaje: 'Empleado registrado.', empleado: nuevo });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error al registrar empleado.' });
  }
};

const actualizar = async (req, res) => {
  try {
    const actualizado = await empleadoLogica.editar(req.params.id, req.body);
    res.json({ mensaje: 'Empleado actualizado.', empleado: actualizado });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error al actualizar empleado.' });
  }
};

const actualizarEstado = async (req, res) => {
  try {
    const actualizado = await empleadoLogica.cambiarEstado(req.params.id, req.body.activo);
    res.json({ mensaje: 'Estado actualizado.', empleado: actualizado });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error al cambiar estado.' });
  }
};

module.exports = {
  listar,
  crear,
  actualizar,
  actualizarEstado,
};