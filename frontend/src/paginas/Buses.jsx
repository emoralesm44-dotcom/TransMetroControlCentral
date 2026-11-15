import React, { useState, useEffect } from 'react';
import { busServicio } from '../servicios/busesServicio';
import { lineaServicio } from '../servicios/lineaServicio';
import { parqueoServicio } from '../servicios/parqueoServicio';
import './ModuloAdmin.css';

export const Buses = () => {
  const [buses, setBuses] = useState([]);
  const [lineas, setLineas] = useState([]);
  const [parqueos, setParqueos] = useState([]);
  const [pilotosLibres, setPilotosLibres] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    codigo_unidad: '',
    placa: '',
    capacidad_maxima: 80,
    id_linea: '',
    id_parqueo: '',
    id_piloto: '',
  });

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [dataBuses, dataLineas, dataParqueos] = await Promise.all([
        busServicio.listar(),
        lineaServicio.listar(),
        parqueoServicio.listar(),
      ]);
      setBuses(dataBuses.buses || []);
      setLineas((dataLineas.lineas || []).filter((l) => l.activo));
      setParqueos((dataParqueos.parqueos || []).filter((p) => p.activo));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirNuevo = async () => {
    setEditandoId(null);
    setFormData({
      codigo_unidad: '',
      placa: '',
      capacidad_maxima: 80,
      id_linea: '',
      id_parqueo: parqueos[0]?.id_parqueo || '',
      id_piloto: '',
    });
    setError('');
    setModalAbierto(true);
    try {
      const dataPilotos = await busServicio.listarPilotosDisponibles();
      setPilotosLibres(dataPilotos.pilotos || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const abrirEditar = async (bus) => {
    setEditandoId(bus.id_bus);
    setFormData({
      codigo_unidad: bus.codigo_unidad,
      placa: bus.placa || '',
      capacidad_maxima: bus.capacidad_maxima,
      id_linea: bus.id_linea || '',
      id_parqueo: bus.id_parqueo || '',
      id_piloto: bus.id_piloto || '',
    });
    setError('');
    setModalAbierto(true);
    try {
      const dataPilotos = await busServicio.listarPilotosDisponibles(bus.id_bus);
      setPilotosLibres(dataPilotos.pilotos || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editandoId) {
        await busServicio.actualizar(editandoId, formData);
      } else {
        await busServicio.crear(formData);
      }
      setModalAbierto(false);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleEstado = async (bus) => {
    try {
      await busServicio.cambiarEstado(bus.id_bus, !bus.activo);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const listaFiltrada = buses.filter(
    (b) =>
      b.codigo_unidad.toLowerCase().includes(filtro.toLowerCase()) ||
      (b.placa || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (b.nombre_linea || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (b.nombre_piloto || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (b.nombre_parqueo || '').toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="modulo-card">
      <div className="modulo-toolbar">
        <input
          type="text"
          placeholder="Buscar por unidad, placa, línea, piloto o parqueo..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="modulo-input-buscar"
        />
        <button type="button" onClick={abrirNuevo} className="btn-primario">
          + Nuevo Bus
        </button>
      </div>

      {error && !modalAbierto && <div className="modulo-alerta-error">{error}</div>}

      {cargando ? (
        <p>Cargando flota de buses...</p>
      ) : (
        <div className="tabla-contenedor">
          <table className="modulo-tabla">
            <thead>
              <tr>
                <th>Unidad</th>
                <th>Placa</th>
                <th>Capacidad</th>
                <th>Línea Asignada</th>
                <th>Piloto Asignado</th>
                <th>Parqueo Base</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: '#6b7280' }}>
                    No hay buses registrados.
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((b) => (
                  <tr key={b.id_bus}>
                    <td><strong>{b.codigo_unidad}</strong></td>
                    <td>{b.placa || '-'}</td>
                    <td>{b.capacidad_maxima} pas.</td>
                    <td>
                      {b.nombre_linea ? (
                        <strong>{b.codigo_linea ? `[${b.codigo_linea}] ` : ''}{b.nombre_linea}</strong>
                      ) : (
                        <span style={{ color: '#6b7280', fontStyle: 'italic' }}>Sin línea asignada</span>
                      )}
                    </td>
                    <td>
                      {b.nombre_piloto ? (
                        <span>{b.nombre_piloto}</span>
                      ) : (
                        <span style={{ color: '#6b7280', fontStyle: 'italic' }}>Sin piloto</span>
                      )}
                    </td>
                    <td>{b.nombre_parqueo || '-'}</td>
                    <td>
                      <span className={`badge-estado ${b.activo ? 'activo' : 'inactivo'}`}>
                        {b.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="acciones-celda">
                      <button type="button" onClick={() => abrirEditar(b)} className="btn-secundario">
                        Editar / Asignar
                      </button>
                      <button type="button" onClick={() => handleToggleEstado(b)} className="btn-estado">
                        {b.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <div className="modal-fondo">
          <div className="modal-caja" style={{ maxWidth: '560px' }}>
            <div className="modal-cabecera">
              <h3>{editandoId ? 'Editar Bus y Asignaciones' : 'Registrar Bus'}</h3>
              <button type="button" onClick={() => setModalAbierto(false)} className="modal-cerrar">×</button>
            </div>

            {error && <div className="modulo-alerta-error">{error}</div>}

            <form onSubmit={handleGuardar} className="modal-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="form-grupo">
                  <label>Código Unidad *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. TM-01"
                    value={formData.codigo_unidad}
                    onChange={(e) => setFormData({ ...formData, codigo_unidad: e.target.value })}
                  />
                </div>

                <div className="form-grupo">
                  <label>Placa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. C-123BJK"
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                  />
                </div>

                <div className="form-grupo">
                  <label>Capacidad *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.capacidad_maxima}
                    onChange={(e) => setFormData({ ...formData, capacidad_maxima: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grupo">
                <label>Línea Asignada (Opcional — máx. 1 línea por bus)</label>
                <select
                  value={formData.id_linea}
                  onChange={(e) => setFormData({ ...formData, id_linea: e.target.value })}
                >
                  <option value="">-- Sin línea asignada (En reserva) --</option>
                  {lineas.map((l) => (
                    <option key={l.id_linea} value={l.id_linea}>
                      {l.codigo ? `[${l.codigo}] ` : ''}{l.nombre_linea}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grupo">
                <label>Piloto Asignado ({pilotosLibres.length} disponibles)</label>
                <select
                  value={formData.id_piloto}
                  onChange={(e) => setFormData({ ...formData, id_piloto: e.target.value })}
                >
                  <option value="">-- Sin piloto asignado --</option>
                  {pilotosLibres.map((p) => (
                    <option key={p.id_empleado} value={p.id_empleado}>
                      {p.nombre} {p.apellido} (DPI: {p.dpi})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grupo">
                <label>Parqueo Base</label>
                <select
                  value={formData.id_parqueo}
                  onChange={(e) => setFormData({ ...formData, id_parqueo: e.target.value })}
                >
                  <option value="">-- Seleccione parqueo --</option>
                  {parqueos.map((p) => (
                    <option key={p.id_parqueo} value={p.id_parqueo}>
                      {p.nombre_parqueo} ({p.nombre_estacion})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-pie">
                <button type="button" onClick={() => setModalAbierto(false)} className="btn-secundario">
                  Cancelar
                </button>
                <button type="submit" className="btn-primario">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};