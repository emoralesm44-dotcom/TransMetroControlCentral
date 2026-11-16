const operadorServicio = require('../servicios/operadorEstacionServicio');

const listar = async (req, res) => {
  try {
    const datos = await operadorServicio.obtenerTodo();
    res.json(datos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const asignacion = await operadorServicio.asignar(req.body);
    res.status(201).json({ mensaje: 'Operador asignado a la estación.', asignacion });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const desactivar = async (req, res) => {
  try {
    const asignacion = await operadorServicio.liberar(req.params.id);
    res.json({ mensaje: 'Asignación liberada.', asignacion });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  listar,
  crear,
  desactivar,
};