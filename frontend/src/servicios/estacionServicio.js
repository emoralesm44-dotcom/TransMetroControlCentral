import { clienteApi } from './api';

export const estacionServicio = {
  listar: () => clienteApi('/estaciones'),

  crear: (datos) =>
    clienteApi('/estaciones', {
      method: 'POST',
      body: datos,
    }),

  actualizar: (id, datos) =>
    clienteApi(`/estaciones/${id}`, {
      method: 'PUT',
      body: datos,
    }),

  cambiarEstado: (id, activo) =>
    clienteApi(`/estaciones/${id}/estado`, {
      method: 'PATCH',
      body: { activo },
    }),

  listarAccesos: (idEstacion) => clienteApi(`/estaciones/${idEstacion}/accesos`),

  crearAcceso: (idEstacion, datos) =>
    clienteApi(`/estaciones/${idEstacion}/accesos`, {
      method: 'POST',
      body: datos,
    }),

  actualizarAcceso: (idAcceso, datos) =>
    clienteApi(`/estaciones/accesos/${idAcceso}`, {
      method: 'PUT',
      body: datos,
    }),

  cambiarEstadoAcceso: (idAcceso, activo) =>
    clienteApi(`/estaciones/accesos/${idAcceso}/estado`, {
      method: 'PATCH',
      body: { activo },
    }),
};