import { clienteApi } from './api';

export const reporteServicio = {
  obtener: (tipo) => clienteApi(`/reportes/${tipo}`),
};