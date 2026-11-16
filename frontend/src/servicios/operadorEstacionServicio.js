import { clienteApi } from './api';

export const operadorEstacionServicio = {
  listar: () => clienteApi('/operador-estacion'),

  asignar: (datos) =>
    clienteApi('/operador-estacion', {
      method: 'POST',
      body: datos,
    }),

  liberar: (id) =>
    clienteApi(`/operador-estacion/${id}/liberar`, {
      method: 'PATCH',
    }),
};