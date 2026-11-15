const parqueoServicio = require('../servicios/parqueoServicio');

const listar = async (req, res) => {
  try {
    const parqueos = await parqueoServicio.obtenerTodos();
    res.json({ parqueos });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al listar parqueos.' });
  }
};

const crear = async (req, res) => {
  try {
    const parqueo = await parqueoServicio.registrar(req.body);
    res.status(201).json({ mensaje: 'Parqueo registrado.', parqueo });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const parqueo = await parqueoServicio.editar(req.params.id, req.body);
    res.json({ mensaje: 'Parqueo actualizado.', parqueo });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const actualizarEstado = async (req, res) => {
  try {
    const parqueo = await parqueoServicio.cambiarEstado(req.params.id, req.body.activo);
    res.json({ mensaje: 'Estado actualizado.', parqueo });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  listar,
  crear,
  actualizar,
  actualizarEstado,
};