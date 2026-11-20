import React, { useState, useEffect } from 'react';
import { dashboardServicio } from '../../servicios/dashboardServicio';
import { TarjetaMetrica } from '../../componentes/TarjetaMetrica';
import '../ModuloAdmin.css';

export const DashboardSupervisor = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const cargar = () => {
    setError('');
    dashboardServicio.obtenerResumen()
      .then(setData)
      .catch((e) => setError(e.message));
  };

  useEffect(() => { cargar(); }, []);

  const marcarAtendida = async (idAlerta) => {
    try {
      await dashboardServicio.atenderAlerta(idAlerta);
      cargar();
    } catch (e) {
      setError(e.message);
    }
  };

  if (error) return <div className="modulo-card"><div className="modulo-alerta-error">{error}</div></div>;
  if (!data) return <div className="modulo-card"><p>Cargando monitoreo operativo...</p></div>;

  return (
    <div className="modulo-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Dashboard — Supervisión Operativa</h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            Monitoreo en tiempo real de estaciones, flota y atención de alertas
          </p>
        </div>
        <button type="button" className="btn-secundario" onClick={cargar}>Actualizar</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <TarjetaMetrica
          titulo="Alertas Activas"
          valor={data.alertasActivas}
          subtitulo="Sobrecupo / baja ocupación"
          color={data.alertasActivas > 0 ? '#dc2626' : '#16a34a'}
        />
        <TarjetaMetrica
          titulo="Buses en Estación"
          valor={data.operacionHoy.buses_en_estacion}
          subtitulo="Pendientes de salida"
          color="#d97706"
        />
        <TarjetaMetrica
          titulo="Pasajeros Hoy"
          valor={data.operacionHoy.pasajeros_hoy.toLocaleString('es-GT')}
          subtitulo={`${data.operacionHoy.viajes_hoy} recorridos hoy`}
          color="#059669"
        />
        <TarjetaMetrica
          titulo="Flota Operativa"
          valor={`${data.buses.activos}/${data.buses.total}`}
          subtitulo={`${data.lineas.activas} líneas • ${data.estaciones} estaciones`}
          color="#0284c7"
        />
        <TarjetaMetrica
          titulo="Parqueos"
          valor={data.parqueos}
          subtitulo="Unidades de apoyo"
          color="#7c3aed"
        />
      </div>

      <div>
        <h3 style={{ marginBottom: '12px' }}>Alertas Recientes en Estaciones</h3>
        <div className="tabla-contenedor">
          <table className="modulo-tabla">
            <thead>
              <tr>
                <th>Estación</th>
                <th>Bus</th>
                <th>Tipo</th>
                <th>Detalle</th>
                <th>Hora</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {data.ultimasAlertas.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#6b7280' }}>
                    Sin alertas registradas.
                  </td>
                </tr>
              ) : data.ultimasAlertas.map((a) => (
                <tr key={a.id_alerta}>
                  <td><strong>{a.estacion}</strong></td>
                  <td>{a.bus}</td>
                  <td>{a.tipo}</td>
                  <td>{a.mensaje}</td>
                  <td>{new Date(a.fecha).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    <span className={`badge-estado ${a.estado === 'ACTIVA' ? 'inactivo' : 'activo'}`}>
                      {a.estado}
                    </span>
                  </td>
                  <td>
                    {a.estado === 'ACTIVA' ? (
                      <button
                        type="button"
                        className="btn-primario"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => marcarAtendida(a.id_alerta)}
                      >
                        Atender
                      </button>
                    ) : (
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>Resuelta</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};