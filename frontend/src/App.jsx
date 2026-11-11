import React, { useState } from 'react';
import { Login } from './paginas/Login';

export function App() {
  const [usuario, setUsuario] = useState(null);

  const handleLoginSuccess = (usuarioLogueado) => {
    setUsuario(usuarioLogueado);
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUsuario(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div>
      {!usuario ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div style={{ padding: '20px', color: '#fff', backgroundColor: '#1e1e1e', minHeight: '100vh' }}>
          <h1>Panel Central Transmetro</h1>
          <p>Bienvenido, <strong>{usuario.nombre_completo}</strong> [{usuario.rol}]</p>
          <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default App;