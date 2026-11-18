import React, { useState, useEffect } from 'react';
import { terminalOperadorServicio } from '../../servicios/terminalOperadorServicio';
import '../ModuloAdmin.css';

export const AlertasEstacion = () => {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    terminalOperadorServicio.obtenerAlertas().then(setInfo).catch((e) => setError(e.message));
  }, []);

  if (error || (info && (info.pendiente || !info.estacion))) {
    return <div className="modulo-card"><div className="modulo-alerta-error">{error || 'Estación pendiente de asignación.'}</div></div>;
  }
  if (!info) return <div className="modulo-card"><p>Cargando alertas...</p></div>;

  return (
    <div className="modulo-card">
      <h3 style={{ marginTop: 0 }}>Alertas — {info.estacion.nombre_estacion}</h3>
      <div className="tabla-contenedor">
        <table className="modulo-tabla">
          <thead>
            <tr><th>Bus</th><th>Tipo</th><th>Mensaje</th><th>Fecha</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {info.alertas.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: '#6b7280' }}>No hay alertas registradas.</td></tr>
            ) : info.alertas.map((a) => (
              <tr key={a.id_alerta}>
                <td><strong>{a.bus}</strong></td>
                <td>{a.tipo}</td>
                <td>{a.mensaje}</td>
                <td>{new Date(a.fecha).toLocaleString('es-GT')}</td>
                <td><span className={`badge-estado ${a.estado === 'ACTIVA' ? 'activo' : 'inactivo'}`}>{a.estado}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};