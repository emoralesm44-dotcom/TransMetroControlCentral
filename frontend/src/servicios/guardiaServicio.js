import { clienteApi } from './api';

export const guardiaServicio = {
  listar: () => clienteApi('/guardias'),

  asignar: (datos) =>
    clienteApi('/guardias', {
      method: 'POST',
      body: datos,
    }),

  liberar: (id) =>
    clienteApi(`/guardias/${id}`, {
      method: 'DELETE',
    }),
};