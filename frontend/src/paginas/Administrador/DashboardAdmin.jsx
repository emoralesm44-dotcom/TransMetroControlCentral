import React, { useState, useEffect } from 'react';
import { dashboardServicio } from '../../servicios/dashboardServicio';
import { TarjetaMetrica } from '../../componentes/TarjetaMetrica';
import '../ModuloAdmin.css';

export const DashboardAdmin = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const cargar = () => {
    setError('');
    dashboardServicio.obtenerResumen()
      .then(setData)
      .catch((e) => setError(e.message));
  };

  useEffect(() => { cargar(); }, []);

  if (error) return <div className="modulo-card"><div className="modulo-alerta-error">{error}</div></div>;
  if (!data) return <div className="modulo-card"><p>Cargando panel administrativo...</p></div>;

  return (
    <div className="modulo-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Dashboard — Administración</h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            Resumen general de infraestructura, flota y operación diaria
          </p>
        </div>
        <button type="button" className="btn-secundario" onClick={cargar}>Actualizar</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px' }}>
        <TarjetaMetrica
          titulo="Líneas Registradas"
          valor={data.lineas.total}
          subtitulo={`${data.lineas.activas} activas en ruta`}
          color="#059669"
        />
        <TarjetaMetrica
          titulo="Buses Totales"
          valor={data.buses.total}
          subtitulo={`${data.buses.activos} activos (${data.porcentajeFlotaActiva ?? 0}%)`}
          color="#0284c7"
        />
        <TarjetaMetrica
          titulo="Estaciones"
          valor={data.estaciones}
          subtitulo="Estaciones habilitadas"
          color="#4f46e5"
        />
        <TarjetaMetrica
          titulo="Parqueos"
          valor={data.parqueos}
          subtitulo="Predios disponibles"
          color="#7c3aed"
        />
        <TarjetaMetrica
          titulo="Alertas Activas"
          valor={data.alertasActivas}
          subtitulo="Pendientes de atención"
          color={data.alertasActivas > 0 ? '#dc2626' : '#16a34a'}
        />
        <TarjetaMetrica
          titulo="Usuarios Activos"
          valor={data.usuariosActivos}
          subtitulo="Personal registrado"
          color="#d97706"
        />
      </div>

      <div>
        <h3 style={{ marginBottom: '12px' }}>Actividad del Día por Línea</h3>
        <div className="tabla-contenedor">
          <table className="modulo-tabla">
            <thead>
              <tr>
                <th>Línea</th>
                <th>Recorridos Registrados Hoy</th>
                <th>Pasajeros Movilizados Hoy</th>
              </tr>
            </thead>
            <tbody>
              {data.ocupacionPorLinea.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: '#6b7280' }}>
                    No hay líneas activas registradas.
                  </td>
                </tr>
              ) : data.ocupacionPorLinea.map((l, idx) => (
                <tr key={idx}>
                  <td><strong>{l.nombre_linea}</strong></td>
                  <td>{l.recorridos}</td>
                  <td>{l.pasajeros.toLocaleString('es-GT')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};