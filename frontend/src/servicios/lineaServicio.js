import { clienteApi } from './api';

export const lineaServicio = {
  listar: () => clienteApi('/lineas'),

  crear: (datos) =>
    clienteApi('/lineas', {
      method: 'POST',
      body: datos,
    }),

  actualizar: (id, datos) =>
    clienteApi(`/lineas/${id}`, {
      method: 'PUT',
      body: datos,
    }),

  cambiarEstado: (id, activo) =>
    clienteApi(`/lineas/${id}/estado`, {
      method: 'PATCH',
      body: { activo },
    }),
};