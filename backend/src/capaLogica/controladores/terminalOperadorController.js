const srv = require('../servicios/terminalOperadorServicio');

const run = (fn) => async (req, res) => {
  try {
    res.json(await fn(req));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  miEstacion: run((req) => srv.obtenerMiEstacion(req.usuario)),
  datosLlegada: run((req) => srv.obtenerDatosLlegada(req.usuario)),
  datosSalida: run((req) => srv.obtenerDatosSalida(req.usuario)),
  datosAlertas: run((req) => srv.obtenerDatosAlertas(req.usuario)),
  guardarLlegada: run((req) => srv.registrarLlegada(req.usuario, req.body)),
  guardarSalida: run((req) => srv.registrarSalida(req.usuario, req.params.id, req.body)),
};