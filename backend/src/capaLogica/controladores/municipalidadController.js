const municipalidadLogica = require('../servicios/municipalidadDatosServicio');

const listar = async (req, res) => {
  try {
    const lista = await municipalidadLogica.obtenerTodas();
    res.json({ municipalidades: lista });
  } catch (error) {
    res.status(500).json({ mensaje: error.message || 'Error al obtener municipalidades.' });
  }
};

const crear = async (req, res) => {
  try {
    const nueva = await municipalidadLogica.registrar(req.body);
    res.status(201).json({ mensaje: 'Municipalidad registrada.', municipalidad: nueva });
  } catch (error) {
    res.status(400).json({ mensaje: error.message || 'Error al registrar municipalidad.' });
  }
};

const actualizar = async (req, res) => {
  try {
    const actualizada = await municipalidadLogica.editar(req.params.id, req.body);
    res.json({ mensaje: 'Municipalidad actualizada.', municipalidad: actualizada });
  } catch (error) {
    res.status(400).json({ mensaje: error.message || 'Error al actualizar municipalidad.' });
  }
};

const actualizarEstado = async (req, res) => {
  try {
    const actualizada = await municipalidadLogica.cambiarEstado(req.params.id, req.body.activo);
    res.json({ mensaje: 'Estado actualizado.', municipalidad: actualizada });
  } catch (error) {
    res.status(400).json({ mensaje: error.message || 'Error al cambiar estado.' });
  }
};

module.exports = {
  listar,
  crear,
  actualizar,
  actualizarEstado,
};