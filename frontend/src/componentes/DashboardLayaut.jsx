import React, { useState } from 'react';
import { ROLES_MENU, ROLES_ETIQUETAS } from '../config/rolesConfig';
import './DashboardLayout.css';

export const DashboardLayout = ({
  usuario,
  moduloActivo,
  onSeleccionarModulo,
  onLogout,
  children,
}) => {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const rolNormalizado = usuario?.rol?.toUpperCase().replace(/\s+/g, '_') || '';
  const opcionesMenu = ROLES_MENU[rolNormalizado] || [];
  const etiquetaRol = ROLES_ETIQUETAS[rolNormalizado] || usuario?.rol;

  const moduloActualObj = opcionesMenu.find((item) => item.id === moduloActivo);
  const tituloHeader = moduloActualObj ? moduloActualObj.titulo : 'Panel de Control';

  const handleSeleccion = (id) => {
    onSeleccionarModulo(id);
    setSidebarAbierto(false);
  };

  return (
    <div className="layout-container">
      {sidebarAbierto && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarAbierto(false)}
        />
      )}

      <aside className={`layout-sidebar ${sidebarAbierto ? 'abierto' : ''}`}>
        <div className="sidebar-brand">
        
          <div className="brand-text">
            <span className="brand-title">Transmetro</span>
            <span className="brand-subtitle">Control Central</span>
          </div>
        </div>

        <div className="sidebar-section-label">Módulos/Funciones</div>

        <nav className="sidebar-nav">
          {opcionesMenu.map((opcion) => {
            const activo = moduloActivo === opcion.id;
            return (
              <button
                key={opcion.id}
                type="button"
                onClick={() => handleSeleccion(opcion.id)}
                className={`sidebar-link ${activo ? 'activo' : ''}`}
              >
                <span className="sidebar-dot" />
                <span>{opcion.titulo}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-role-pill">{etiquetaRol}</span>
        </div>
      </aside>

      <div className="layout-main">
        <header className="layout-header">
          <div className="header-left">
            <button
              type="button"
              className="header-menu-btn"
              onClick={() => setSidebarAbierto(!sidebarAbierto)}
              aria-label="Abrir menú"
            >
              ☰
            </button>
            <div>
              <h2 className="header-page-title">{tituloHeader}</h2>
              <span className="header-breadcrumb">Sistema de Gestión Operativa</span>
            </div>
          </div>

          <div className="header-right">
            <div className="header-user-info">
              <span className="header-user-name">{usuario?.nombre_completo}</span>
              <span className="header-user-role">{etiquetaRol}</span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="header-logout-btn"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
};