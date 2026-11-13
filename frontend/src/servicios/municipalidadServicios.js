import { clienteApi } from './api';

export const municipalidadServicio = {
  listar: () => clienteApi('/municipalidades'),

  crear: (datos) =>
    clienteApi('/municipalidades', {
      method: 'POST',
      body: datos,
    }),

  actualizar: (id, datos) =>
    clienteApi(`/municipalidades/${id}`, {
      method: 'PUT',
      body: datos,
    }),

  cambiarEstado: (id, activo) =>
    clienteApi(`/municipalidades/${id}/estado`, {
      method: 'PATCH',
      body: { activo },
    }),
};