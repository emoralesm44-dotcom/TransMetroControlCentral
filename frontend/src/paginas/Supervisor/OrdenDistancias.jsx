import React, { useState, useEffect } from 'react';
import { lineaServicio } from '../../servicios/lineaServicio';
import { lineaEstacionServicio } from '../../servicios/lineaEstacioneServicio';
import '../ModuloAdmin.css';

export const OrdenDistancias = () => {
  const [lineas, setLineas] = useState([]);
  const [idLineaSeleccionada, setIdLineaSeleccionada] = useState('');
  const [ruta, setRuta] = useState([]);
  const [disponibles, setDisponibles] = useState([]);
  const [estacionAgregar, setEstacionAgregar] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const cargarLineas = async () => {
    try {
      setCargando(true);
      const data = await lineaServicio.listar();
      const activas = (data.lineas || []).filter((l) => l.activo);
      setLineas(activas);
      if (activas.length > 0 && !idLineaSeleccionada) {
        setIdLineaSeleccionada(String(activas[0].id_linea));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const cargarRutaDeLinea = async (idLinea) => {
    if (!idLinea) return;
    try {
      setCargando(true);
      setError('');
      const data = await lineaEstacionServicio.obtenerPorLinea(idLinea);
      setRuta(data.ruta || []);
      setDisponibles(data.disponibles || []);
      setEstacionAgregar(data.disponibles?.[0]?.id_estacion ? String(data.disponibles[0].id_estacion) : '');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarLineas();
  }, []);

  useEffect(() => {
    if (idLineaSeleccionada) {
      cargarRutaDeLinea(idLineaSeleccionada);
    }
  }, [idLineaSeleccionada]);

  const handleAgregarEstacion = () => {
    if (!estacionAgregar) return;
    const estObj = disponibles.find((e) => String(e.id_estacion) === String(estacionAgregar));
    if (!estObj) return;

    const nuevaRuta = [
      ...ruta,
      {
        id_estacion: estObj.id_estacion,
        nombre_estacion: estObj.nombre_estacion,
        nombre_municipalidad: estObj.nombre_municipalidad,
        distancia_siguiente_km: 0,
      },
    ];
    const nuevosDisponibles = disponibles.filter((e) => String(e.id_estacion) !== String(estacionAgregar));

    setRuta(nuevaRuta);
    setDisponibles(nuevosDisponibles);
    setEstacionAgregar(nuevosDisponibles[0]?.id_estacion ? String(nuevosDisponibles[0].id_estacion) : '');
    setMensaje('');
  };

  const handleQuitarEstacion = (idx) => {
    const removida = ruta[idx];
    const nuevaRuta = ruta.filter((_, i) => i !== idx);
    if (nuevaRuta.length > 0) {
      nuevaRuta[nuevaRuta.length - 1].distancia_siguiente_km = 0;
    }
    const nuevosDisponibles = [...disponibles, removida].sort((a, b) =>
      a.nombre_estacion.localeCompare(b.nombre_estacion)
    );

    setRuta(nuevaRuta);
    setDisponibles(nuevosDisponibles);
    if (!estacionAgregar) {
      setEstacionAgregar(String(removida.id_estacion));
    }
    setMensaje('');
  };

  const moverEstacion = (idx, direccion) => {
    const destino = idx + direccion;
    if (destino < 0 || destino >= ruta.length) return;
    const copia = [...ruta];
    const temp = copia[idx];
    copia[idx] = copia[destino];
    copia[destino] = temp;
    copia[copia.length - 1].distancia_siguiente_km = 0;
    setRuta(copia);
    setMensaje('');
  };

  const handleCambiarDistancia = (idx, valor) => {
    const copia = [...ruta];
    copia[idx].distancia_siguiente_km = valor;
    setRuta(copia);
    setMensaje('');
  };

  const handleGuardarRuta = async () => {
    setError('');
    setMensaje('');
    try {
      setGuardando(true);
      const res = await lineaEstacionServicio.guardarRuta(idLineaSeleccionada, ruta);
      setMensaje(`Ruta guardada. Distancia total de la línea: ${res.linea?.distancia_total_km} km.`);
      await cargarLineas();
      await cargarRutaDeLinea(idLineaSeleccionada);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const distanciaTotalCalculada = ruta.reduce((acc, item, idx) => {
    if (idx === ruta.length - 1) return acc;
    return acc + (Number(item.distancia_siguiente_km) || 0);
  }, 0);

  let acumulado = 0;

  return (
    <div className="modulo-card">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          padding: '14px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <div className="form-grupo" style={{ margin: 0 }}>
          <label>1. Seleccionar Línea *</label>
          <select
            value={idLineaSeleccionada}
            onChange={(e) => {
              setIdLineaSeleccionada(e.target.value);
              setMensaje('');
            }}
          >
            <option value="">-- Seleccione una línea --</option>
            {lineas.map((l) => (
              <option key={l.id_linea} value={l.id_linea}>
                {l.nombre_linea} ({Number(l.distancia_total_km || 0).toFixed(2)} km)
              </option>
            ))}
          </select>
        </div>

        <div className="form-grupo" style={{ margin: 0 }}>
          <label>2. Agregar Estación al Recorrido</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={estacionAgregar}
              onChange={(e) => setEstacionAgregar(e.target.value)}
              disabled={!idLineaSeleccionada || disponibles.length === 0}
              style={{ flex: 1 }}
            >
              {disponibles.length === 0 ? (
                <option value="">No hay más estaciones disponibles</option>
              ) : (
                disponibles.map((est) => (
                  <option key={est.id_estacion} value={est.id_estacion}>
                    {est.nombre_estacion} ({est.nombre_municipalidad})
                  </option>
                ))
              )}
            </select>
            <button
              type="button"
              onClick={handleAgregarEstacion}
              disabled={!estacionAgregar}
              className="btn-primario"
              style={{ whiteSpace: 'nowrap' }}
            >
              + Añadir
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-end',
            background: '#ffffff',
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
          }}
        >
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Distancia Total de la Línea</span>
          <strong style={{ fontSize: '20px', color: '#047857' }}>
            {distanciaTotalCalculada.toFixed(2)} km
          </strong>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>{ruta.length} estaciones en ruta</span>
        </div>
      </div>

      {error && <div className="modulo-alerta-error">{error}</div>}
      {mensaje && (
        <div
          style={{
            padding: '10px 14px',
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            borderRadius: '6px',
            marginBottom: '12px',
          }}
        >
          {mensaje}
        </div>
      )}

      {cargando ? (
        <p>Cargando recorrido de la línea...</p>
      ) : (
        <>
          <div className="tabla-contenedor">
            <table className="modulo-tabla">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>Orden</th>
                  <th>Estación</th>
                  <th>Municipalidad</th>
                  <th>Siguiente Estación</th>
                  <th style={{ width: '160px' }}>Distancia Tramo (km)</th>
                  <th style={{ width: '130px' }}>Km Acumulado</th>
                  <th style={{ width: '160px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ruta.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: '#6b7280' }}>
                      Esta línea aún no tiene estaciones asignadas. Añade estaciones arriba para armar la ruta.
                    </td>
                  </tr>
                ) : (
                  ruta.map((item, idx) => {
                    const esUltima = idx === ruta.length - 1;
                    const siguiente = !esUltima ? ruta[idx + 1] : null;
                    const kmActual = acumulado;
                    acumulado += esUltima ? 0 : Number(item.distancia_siguiente_km) || 0;

                    return (
                      <tr key={item.id_estacion}>
                        <td>
                          <strong>#{idx + 1}</strong>
                        </td>
                        <td>
                          <strong>{item.nombre_estacion}</strong>
                        </td>
                        <td>{item.nombre_municipalidad}</td>
                        <td style={{ color: '#4b5563' }}>
                          {siguiente ? `→ ${siguiente.nombre_estacion}` : <em>Terminal / Fin de línea</em>}
                        </td>
                        <td>
                          {esUltima ? (
                            <span style={{ color: '#9ca3af' }}>0.00 km (Fin)</span>
                          ) : (
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={item.distancia_siguiente_km}
                              onChange={(e) => handleCambiarDistancia(idx, e.target.value)}
                              className="modulo-input-buscar"
                              style={{ width: '110px', padding: '4px 8px' }}
                            />
                          )}
                        </td>
                        <td>
                          <strong>{kmActual.toFixed(2)} km</strong>
                        </td>
                        <td className="acciones-celda">
                          <button
                            type="button"
                            onClick={() => moverEstacion(idx, -1)}
                            disabled={idx === 0}
                            className="btn-secundario"
                            title="Subir"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moverEstacion(idx, 1)}
                            disabled={esUltima}
                            className="btn-secundario"
                            title="Bajar"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuitarEstacion(idx)}
                            className="btn-estado"
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {idLineaSeleccionada && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                onClick={handleGuardarRuta}
                disabled={guardando}
                className="btn-primario"
              >
                {guardando ? 'Guardando...' : 'Guardar Orden y Distancias'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};