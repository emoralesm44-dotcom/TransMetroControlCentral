import React, { useState, useEffect } from 'react';
import { Login } from './paginas/Login';
import { PanelPrincipal } from './paginas/PanelPrincipal';
import { authService } from './servicios/authServicio';
import { esRolValido } from './config/rolesConfig';

export function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const comprobarSesion = async () => {
      try {
        const datos = await authService.verificarSesion();
        const perfil = datos.usuario || datos;

        if (esRolValido(perfil?.rol)) {
          setUsuario(perfil);
        } else {
          await authService.logout();
          setUsuario(null);
        }
      } catch {
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    };

    comprobarSesion();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error(error);
    } finally {
      setUsuario(null);
    }
  };

  if (cargando) {
    return (
      <div style={{ padding: '20px', color: '#fff', backgroundColor: '#1e1e1e', minHeight: '100vh' }}>
        Cargando...
      </div>
    );
  }

  if (!usuario) {
    return <Login onLoginSuccess={setUsuario} />;
  }

  return (
    <div style={{ padding: '20px', color: '#fff', backgroundColor: '#1e1e1e', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>Panel Central Transmetro</h1>
          <p>Bienvenido, <strong>{usuario.nombre_completo}</strong> [{usuario.rol}]</p>
        </div>
        <button
          onClick={handleLogout}
          style={{ padding: '8px 16px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Cerrar Sesión
        </button>
      </header>

      <main>
        <PanelPrincipal usuario={usuario} />
      </main>
    </div>
  );
}

export default App;