import { clienteApi } from './api';

export const terminalOperadorServicio = {
  obtenerMiEstacion: () => clienteApi('/terminal-operador/mi-estacion'),
  obtenerDatosLlegada: () => clienteApi('/terminal-operador/llegada'),
  guardarLlegada: (body) => clienteApi('/terminal-operador/llegada', { method: 'POST', body }),
  obtenerDatosSalida: () => clienteApi('/terminal-operador/salida'),
  guardarSalida: (id, body) => clienteApi(`/terminal-operador/salida/${id}`, { method: 'PATCH', body }),
  obtenerAlertas: () => clienteApi('/terminal-operador/alertas'),
};