import { clienteApi } from './api';

export const dashboardServicio = {
  obtenerResumen: () => clienteApi('/dashboard/resumen'),
  atenderAlerta: (idAlerta) => clienteApi(`/dashboard/alertas/${idAlerta}/atender`, { method: 'PATCH' }),
};