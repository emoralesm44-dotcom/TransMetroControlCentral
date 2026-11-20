import React, { useState, useEffect } from 'react';
import { authService } from './servicios/authServicio';
import { Login } from './paginas/Login';
import { DashboardLayout } from './componentes/DashboardLayaut';
import { Municipalidades } from './paginas/Administrador/Municipalidades';
import { Personal } from './paginas/Administrador/Personal';
import { Usuarios } from './paginas/Administrador/Usuarios';
import { DashboardAdmin } from './paginas/Administrador/DashboardAdmin';
import { Lineas } from './paginas/Supervisor/Lineas';
import { Estaciones } from './paginas/Supervisor/Estaciones';
import { Guardias } from './paginas/Supervisor/Guardias';
import { Parqueos } from './paginas/Supervisor/Parqueos';
import { Buses } from './paginas/Supervisor/Buses';
import { OrdenDistancias } from './paginas/Supervisor/OrdenDistancias';
import { OperadoresEstacion } from './paginas/Supervisor/OperadorEstacion';
import { Reportes } from './paginas/Supervisor/Reportes';
import { DashboardSupervisor } from './paginas/Supervisor/DashboardSupervisor';
import { MiEstacion } from './paginas/Operador/MiEstacion';
import { AlertasEstacion } from './paginas/Operador/Alertas';
import { ControlLlegadaSalida } from './paginas/Operador/Control';

const obtenerModuloInicial = (usuario) => {
  const rol = (usuario?.rol || '').toUpperCase().replace(/\s+/g, '_');
  return rol === 'OPERADOR_ESTACION' ? 'mi-estacion' : 'inicio';
};

export function App() {
  const [usuario, setUsuario] = useState(null);
  const [verificandoSesion, setVerificandoSesion] = useState(true);
  const [moduloActivo, setModuloActivo] = useState('inicio');

  useEffect(() => {
    const comprobarSesion = async () => {
      try {
        const data = await authService.verificarSesion();
        if (data?.usuario) {
          setUsuario(data.usuario);
          setModuloActivo(obtenerModuloInicial(data.usuario));
        }
      } catch {
        setUsuario(null);
      } finally {
        setVerificandoSesion(false);
      }
    };
    comprobarSesion();
  }, []);

  // Guarda los datos del usuario al iniciar sesión y muestra la vista inicial
  const handleLoginSuccess = (datosUsuario) => {
    setUsuario(datosUsuario);
    setModuloActivo(obtenerModuloInicial(datosUsuario));
  };

  // Cierra la sesión en el backend y limpia el estado del usuario
  const handleLogout = async () => {
    await authService.logout();
    setUsuario(null);
    setModuloActivo('inicio');
  };

  // Determina el dashboard principal según el rol del usuario autenticado
  const renderizarInicioPorRol = () => {
    const rol = (usuario?.rol || '').toUpperCase();
    if (rol.includes('ADMINISTRADOR')) return <DashboardAdmin />;
    if (rol.includes('SUPERVISOR')) return <DashboardSupervisor />;

  };

  // Renderiza el componente correspondiente al módulo seleccionado en el menú
  const renderizarContenido = () => {
    switch (moduloActivo) {
      case 'municipalidades':
        return <Municipalidades />;
      case 'personal':
        return <Personal />;
      case 'usuarios':
        return <Usuarios />;
      case 'lineas':
        return <Lineas />;
      case 'estaciones':
        return <Estaciones />;
      case 'guardias':
        return <Guardias />;
      case 'parqueos':
        return <Parqueos />;
      case 'buses':
        return <Buses />;
      case 'orden-distancias':
        return <OrdenDistancias />;
      case 'operadores-estacion':
        return <OperadoresEstacion />;
      case 'reportes':
        return <Reportes />;
      case 'mi-estacion':
        return <MiEstacion />;
      case 'alertas-estacion':
        return <AlertasEstacion />;
      case 'llegada-salida':
        return <ControlLlegadaSalida />;
      case 'inicio':
      default:
        return renderizarInicioPorRol();
    }
  };

  // Pantalla de espera mientras se valida la sesión inicial
  if (verificandoSesion) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f6f8', color: '#1f2937' }}>
        Verificando sesión...
      </div>
    );
  }

  // Si no hay usuario autenticado muestra la pantalla de inicio de sesión
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
