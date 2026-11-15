const guardiaServicio = require('../servicios/guardiaServicio');

const listar = async (req, res) => {
  try {
    const datos = await guardiaServicio.obtenerDatosModulo();
    res.json(datos);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al cargar asignaciones de guardias.' });
  }
};

const crear = async (req, res) => {
  try {
    const asignacion = await guardiaServicio.asignar(req.body);
    res.status(201).json({ mensaje: 'Guardia asignado correctamente.', asignacion });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const eliminar = async (req, res) => {
  try {
    await guardiaServicio.liberar(req.params.id);
    res.json({ mensaje: 'Guardia liberado del acceso.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  listar,
  crear,
  eliminar,
};