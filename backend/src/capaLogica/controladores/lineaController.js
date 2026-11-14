const lineaServicio = require('../servicios/lineasServicio');

const listar = async (req, res) => {
  try {
    const lineas = await lineaServicio.obtenerTodas();
    res.json({ lineas });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al listar líneas.' });
  }
};

const crear = async (req, res) => {
  try {
    const linea = await lineaServicio.registrar(req.body);
    res.status(201).json({ mensaje: 'Línea registrada.', linea });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const linea = await lineaServicio.editar(req.params.id, req.body);
    res.json({ mensaje: 'Línea actualizada.', linea });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const actualizarEstado = async (req, res) => {
  try {
    const linea = await lineaServicio.cambiarEstado(req.params.id, req.body.activo);
    res.json({ mensaje: 'Estado actualizado.', linea });
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