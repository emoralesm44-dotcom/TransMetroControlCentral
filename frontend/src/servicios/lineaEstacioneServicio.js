import { clienteApi } from './api';

export const lineaEstacionServicio = {
  obtenerPorLinea: (idLinea) => clienteApi(`/linea-estaciones/${idLinea}`),

  guardarRuta: (idLinea, estaciones) =>
    clienteApi(`/linea-estaciones/${idLinea}`, {
      method: 'PUT',
      body: { estaciones },
    }),
};