const dashboardServicio = require('../servicios/dashboardServicio');

const obtenerResumen = async (req, res) => {
  try {
    const data = await dashboardServicio.obtenerResumenDashboard();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error al obtener el resumen del dashboard.' });
  }
};

const atenderAlerta = async (req, res) => {
  try {
    const actualizada = await dashboardServicio.atenderAlerta(req.params.id);
    res.json(actualizada);
  } catch (error) {
    const status = error.message.includes('inválido') || error.message.includes('no existe') ? 400 : 500;
    res.status(status).json({ error: error.message });
  }
};

module.exports = { obtenerResumen, atenderAlerta };