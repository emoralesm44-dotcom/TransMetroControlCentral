const reporteServicio = require('../servicios/reporteServicio');

const consultar = async (req, res) => {
  try {
    const datos = await reporteServicio.obtenerReporte(req.params.tipo);
    res.json({ datos });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  consultar,
};