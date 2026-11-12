const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const clienteApi = async (endpoint, opciones = {}) => {
  const configuracion = {
    method: opciones.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...opciones.headers,
    },
    credentials: 'include',
    ...opciones,
  };

  if (opciones.body) {
    configuracion.body = JSON.stringify(opciones.body);
  }

  const respuesta = await fetch(`${API_URL}${endpoint}`, configuracion);
  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.error || 'Error al procesar la solicitud.');
  }

  return data;
};