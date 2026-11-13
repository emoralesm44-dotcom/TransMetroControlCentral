import { clienteApi } from './api';

export const empleadoServicio = {
  listar: () => clienteApi('/empleados'),

  crear: (datos) =>
    clienteApi('/empleados', {
      method: 'POST',
      body: datos,
    }),

  actualizar: (id, datos) =>
    clienteApi(`/empleados/${id}`, {
      method: 'PUT',
      body: datos,
    }),

  cambiarEstado: (id, activo) =>
    clienteApi(`/empleados/${id}/estado`, {
      method: 'PATCH',
      body: { activo },
    }),
};