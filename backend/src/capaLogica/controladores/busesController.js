const busServicio = require('../servicios/busesServicio');

const listar = async (req, res) => {
  try {
    const buses = await busServicio.obtenerTodos();
    res.json({ buses });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al listar buses.' });
  }
};

const listarPilotosLibres = async (req, res) => {
  try {
    const pilotos = await busServicio.obtenerPilotosDisponibles(req.query.idBus);
    res.json({ pilotos });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al obtener pilotos disponibles.' });
  }
};

const crear = async (req, res) => {
  try {
    const bus = await busServicio.registrar(req.body);
    res.status(201).json({ mensaje: 'Bus registrado.', bus });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const bus = await busServicio.editar(req.params.id, req.body);
    res.json({ mensaje: 'Bus actualizado.', bus });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const actualizarEstado = async (req, res) => {
  try {
    const bus = await busServicio.cambiarEstado(req.params.id, req.body.activo);
    res.json({ mensaje: 'Estado actualizado.', bus });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  listar,
  listarPilotosLibres,
  crear,
  actualizar,
  actualizarEstado,
};