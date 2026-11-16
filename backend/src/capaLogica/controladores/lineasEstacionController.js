const lineaEstacionServicio = require('../servicios/lineasEstacionesServicio');

const obtenerPorLinea = async (req, res) => {
  try {
    const datos = await lineaEstacionServicio.obtenerRutaLinea(req.params.idLinea);
    res.json(datos);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const guardar = async (req, res) => {
  try {
    const lineaActualizada = await lineaEstacionServicio.guardarRuta(
      req.params.idLinea,
      req.body.estaciones
    );
    res.json({
      mensaje: 'Orden y distancias de la línea actualizados.',
      linea: lineaActualizada,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  obtenerPorLinea,
  guardar,
};