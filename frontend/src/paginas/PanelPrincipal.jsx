import React, { useState } from 'react';
import { ROLES_MENU } from '../config/rolesConfig';
import { UsuariosRoles } from '../modulos/UsuariosRoles';

const COMPONENTES_MODULOS = {
  usuarios: UsuariosRoles,
};

export function PanelPrincipal({ usuario }) {
  const rolKey = usuario.rol?.toUpperCase().replace(/\s+/g, '_');
  const modulosPermitidos = ROLES_MENU[rolKey] || [];
  const [moduloActivo, setModuloActivo] = useState(modulosPermitidos[0]?.id || null);

  if (modulosPermitidos.length === 0) {
    return <p>Tu rol ({usuario.rol}) no tiene módulos asignados.</p>;
  }

  const VistaActual = COMPONENTES_MODULOS[moduloActivo];

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '230px' }}>
        {modulosPermitidos.map((modulo) => (
          <button
            key={modulo.id}
            onClick={() => setModuloActivo(modulo.id)}
            style={{
              padding: '10px',
              textAlign: 'left',
              backgroundColor: moduloActivo === modulo.id ? '#2980b9' : '#2c3e50',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {modulo.titulo}
          </button>
        ))}
      </nav>

      <section style={{ flex: 1, padding: '20px', backgroundColor: '#252525' }}>
        {VistaActual ? (
          <VistaActual usuario={usuario} />
        ) : (
          <h2>Módulo "{moduloActivo}" en construcción</h2>
        )}
      </section>
    </div>
  );
}