import React, { useState, useEffect } from 'react';
import { terminalOperadorServicio } from '../../servicios/terminalOperadorServicio';
import '../ModuloAdmin.css';

export const MiEstacion = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    terminalOperadorServicio.obtenerMiEstacion().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error || (data && (data.pendiente || !data.estacion))) {
    return (
      <div className="modulo-card">
        {error ? <div className="modulo-alerta-error">{error}</div> : (
          <>
            <h3>Mi Estación: <span style={{ color: '#b45309' }}>Pendiente</span></h3>
            <div className="modulo-alerta-error">El administrador debe editar al operador y asignarle una estación.</div>
          </>
        )}
      </div>
    );
  }
  if (!data) return <div className="modulo-card"><p>Cargando estación...</p></div>;

  const { estacion, recorridos, alertas } = data;

  return (
    <div className="modulo-card">
      <div className="modulo-toolbar">
        <div>
          <small style={{ color: '#6b7280' }}>Estación asignada (Solo consulta)</small>
          <h3 style={{ margin: 0, color: '#065f46' }}>{estacion.nombre_estacion} ({estacion.municipalidad})</h3>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        <div style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}><small style={{ color: '#6b7280' }}>Registros mostrados</small><div><strong>{recorridos.length}</strong></div></div>
        <div style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}><small style={{ color: '#6b7280' }}>Alertas recientes</small><div><strong>{alertas.length}</strong></div></div>
      </div>
      <h4>Últimos buses registrados</h4>
      <div className="tabla-contenedor" style={{ marginBottom: '16px' }}>
        <table className="modulo-tabla">
          <thead><tr><th>Bus</th><th>Línea</th><th>Pasajeros</th><th>Llegada</th><th>Salida</th><th>Estado</th></tr></thead>
          <tbody>
            {recorridos.length === 0 ? <tr><td colSpan="6" style={{ textAlign: 'center', color: '#6b7280' }}>Sin registros.</td></tr> : recorridos.map((r) => (
              <tr key={r.id_recorrido}>
                <td><strong>{r.codigo_unidad}</strong></td><td>{r.nombre_linea}</td><td>{r.pasajeros} / {r.capacidad_maxima}</td>
                <td>{new Date(r.hora_llegada).toLocaleString('es-GT')}</td>
                <td>{r.hora_llegada && r.hora_salida ? new Date(r.hora_salida).toLocaleString('es-GT') : 'En estación'}</td>
                <td><span className={`badge-estado ${r.hora_salida ? 'inactivo' : 'activo'}`}>{r.hora_salida ? 'Completado' : 'En estación'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h4>Alertas de la estación</h4>
      <div className="tabla-contenedor">
        <table className="modulo-tabla">
          <thead><tr><th>Bus</th><th>Tipo</th><th>Mensaje</th><th>Fecha</th><th>Estado</th></tr></thead>
          <tbody>
            {alertas.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center', color: '#6b7280' }}>Sin alertas.</td></tr> : alertas.map((a) => (
              <tr key={a.id_alerta}>
                <td><strong>{a.bus}</strong></td><td>{a.tipo}</td><td>{a.mensaje}</td>
                <td>{new Date(a.fecha).toLocaleString('es-GT')}</td><td>{a.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};