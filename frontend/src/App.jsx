import React, { useState, useEffect } from 'react';
import { authService } from './servicios/authServicio';
import { Login } from './paginas/Login';
import { DashboardLayout } from './componentes/DashboardLayaut';
import { Municipalidades } from './paginas/Municipalidades';
import { Personal } from './paginas/Personal';

export function App() {
  const [usuario, setUsuario] = useState(null);
  const [verificandoSesion, setVerificandoSesion] = useState(true);
  const [moduloActivo, setModuloActivo] = useState('inicio');

  useEffect(() => {
    const comprobarSesion = async () => {
      try {
        const data = await authService.obtenerPerfil();
        if (data?.usuario) {
          setUsuario(data.usuario);
        }
      } catch {
        setUsuario(null);
      } finally {
        setVerificandoSesion(false);
      }
    };
    comprobarSesion();
  }, []);

  const handleLoginSuccess = (datosUsuario) => {
    setUsuario(datosUsuario);
    setModuloActivo('inicio');
  };

  const handleLogout = async () => {
    await authService.logout();
    setUsuario(null);
    setModuloActivo('inicio');
  };

  const renderizarContenido = () => {
    switch (moduloActivo) {
      case 'municipalidades':
        return <Municipalidades />;
      case 'personal':
        return <Personal />;
      default:
        return (
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
            <h3 style={{ marginTop: 0 }}>Bienvenido, {usuario.nombre_completo}</h3>
            <p style={{ color: '#4b5563', marginBottom: 0 }}>
              Módulo seleccionado: <strong>{moduloActivo}</strong> — Rol activo: <strong>{usuario.rol}</strong>
            </p>
          </div>
        );
    }
  };

  if (verificandoSesion) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f6f8', color: '#1f2937' }}>
        Verificando sesión...
      </div>
    );
  }

  if (!usuario) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <DashboardLayout
      usuario={usuario}
      moduloActivo={moduloActivo}
      onSeleccionarModulo={setModuloActivo}
      onLogout={handleLogout}
    >
      {renderizarContenido()}
    </DashboardLayout>
  );
}

export default App;