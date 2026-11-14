import { clienteApi } from './api';

export const usuarioServicio = {
  listar: () => clienteApi('/usuarios'),

  crear: (datos) =>
    clienteApi('/usuarios', {
      method: 'POST',
      body: datos,
    }),

  actualizar: (id, datos) =>
    clienteApi(`/usuarios/${id}`, {
      method: 'PUT',
      body: datos,
    }),

  cambiarEstado: (id, activo) =>
    clienteApi(`/usuarios/${id}/estado`, {
      method: 'PATCH',
      body: { activo },
    }),
};