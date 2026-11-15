import { clienteApi } from './api';

export const busServicio = {
  listar: () => clienteApi('/buses'),

  listarPilotosDisponibles: (idBus = '') =>
    clienteApi(`/buses/pilotos-disponibles${idBus ? `?idBus=${idBus}` : ''}`),

  crear: (datos) =>
    clienteApi('/buses', {
      method: 'POST',
      body: datos,
    }),

  actualizar: (id, datos) =>
    clienteApi(`/buses/${id}`, {
      method: 'PUT',
      body: datos,
    }),

  cambiarEstado: (id, activo) =>
    clienteApi(`/buses/${id}/estado`, {
      method: 'PATCH',
      body: { activo },
    }),
};