const estacionServicio = require('../servicios/estacionServicio');

const listar = async (req, res) => {
  try {
    const estaciones = await estacionServicio.obtenerTodas();
    res.json({ estaciones });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al listar estaciones.' });
  }
};

const crear = async (req, res) => {
  try {
    const estacion = await estacionServicio.registrar(req.body);
    res.status(201).json({ mensaje: 'Estación y accesos registrados.', estacion });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const estacion = await estacionServicio.editar(req.params.id, req.body);
    res.json({ mensaje: 'Estación actualizada.', estacion });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const actualizarEstado = async (req, res) => {
  try {
    const estacion = await estacionServicio.cambiarEstado(req.params.id, req.body.activo);
    res.json({ mensaje: 'Estado actualizado.', estacion });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const listarAccesos = async (req, res) => {
  try {
    const accesos = await estacionServicio.obtenerAccesos(req.params.id);
    res.json({ accesos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crearAcceso = async (req, res) => {
  try {
    const acceso = await estacionServicio.agregarAcceso(req.params.id, req.body);
    res.status(201).json({ mensaje: 'Acceso agregado.', acceso });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const actualizarAcceso = async (req, res) => {
  try {
    const acceso = await estacionServicio.editarAcceso(req.params.idAcceso, req.body);
    res.json({ mensaje: 'Acceso actualizado.', acceso });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const actualizarEstadoAcceso = async (req, res) => {
  try {
    const acceso = await estacionServicio.cambiarEstadoAcceso(req.params.idAcceso, req.body.activo);
    res.json({ mensaje: 'Estado de acceso actualizado.', acceso });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  listar,
  crear,
  actualizar,
  actualizarEstado,
  listarAccesos,
  crearAcceso,
  actualizarAcceso,
  actualizarEstadoAcceso,
};