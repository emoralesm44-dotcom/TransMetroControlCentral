import { clienteApi } from './api';

export const parqueoServicio = {
  listar: () => clienteApi('/parqueos'),

  crear: (datos) =>
    clienteApi('/parqueos', {
      method: 'POST',
      body: datos,
    }),

  actualizar: (id, datos) =>
    clienteApi(`/parqueos/${id}`, {
      method: 'PUT',
      body: datos,
    }),

  cambiarEstado: (id, activo) =>
    clienteApi(`/parqueos/${id}/estado`, {
      method: 'PATCH',
      body: { activo },
    }),
};