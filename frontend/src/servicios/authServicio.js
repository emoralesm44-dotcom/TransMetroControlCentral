import { clienteApi } from './api';

export const authService = {
  login: async (credenciales) => {
    return await clienteApi('/auth/login', {
      method: 'POST',
      body: credenciales,
    });
  },

  logout: async () => {
    return await clienteApi('/auth/logout', {
      method: 'POST',
    });
  },

  verificarSesion: async () => {
    return await clienteApi('/auth/perfil');
  },
};