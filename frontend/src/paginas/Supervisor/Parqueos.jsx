import React, { useState, useEffect } from 'react';
import { parqueoServicio } from '../../servicios/parqueoServicio';
import { estacionServicio } from '../../servicios/estacionServicio';
import '../ModuloAdmin.css';

export const Parqueos = () => {
  const [parqueos, setParqueos] = useState([]);
  const [estaciones, setEstaciones] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    nombre_parqueo: '',
    id_estacion: '',
    capacidad_unidades: 5,
    descripcion: '',
  });

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [dataParq, dataEst] = await Promise.all([
        parqueoServicio.listar(),
        estacionServicio.listar(),
      ]);
      setParqueos(dataParq.parqueos || []);
      setEstaciones((dataEst.estaciones || []).filter((e) => e.activo));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirNuevo = () => {
    setEditandoId(null);
    setFormData({
      nombre_parqueo: '',
      id_estacion: estaciones[0]?.id_estacion || '',
      capacidad_unidades: 5,
      descripcion: '',
    });
    setError('');
    setModalAbierto(true);
  };

  const abrirEditar = (p) => {
    setEditandoId(p.id_parqueo);
    setFormData({
      nombre_parqueo: p.nombre_parqueo,
      id_estacion: p.id_estacion,
      capacidad_unidades: p.capacidad_unidades,
      descripcion: p.descripcion || '',
    });
    setError('');
    setModalAbierto(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editandoId) {
        await parqueoServicio.actualizar(editandoId, formData);
      } else {
        await parqueoServicio.crear(formData);
      }
      setModalAbierto(false);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleEstado = async (p) => {
    try {
      await parqueoServicio.cambiarEstado(p.id_parqueo, !p.activo);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const listaFiltrada = parqueos.filter(
    (p) =>
      p.nombre_parqueo.toLowerCase().includes(filtro.toLowerCase()) ||
      p.nombre_estacion.toLowerCase().includes(filtro.toLowerCase()) ||
      p.nombre_municipalidad.toLowerCase().includes(filtro.toLowerCase()) ||
      (p.descripcion || '').toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="modulo-card">
      <div className="modulo-toolbar">
        <input
          type="text"
          placeholder="Buscar parqueo, estación, ubicación o municipalidad..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="modulo-input-buscar"
        />
        <button type="button" onClick={abrirNuevo} className="btn-primario">
          + Nuevo Parqueo
        </button>
      </div>

      {error && !modalAbierto && <div className="modulo-alerta-error">{error}</div>}

      {cargando ? (
        <p>Cargando parqueos...</p>
      ) : (
        <div className="tabla-contenedor">
          <table className="modulo-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Parqueo</th>
                <th>Estación</th>
                <th>Municipalidad</th>
                <th>Ubicación / Descripción</th>
                <th>Capacidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: '#6b7280' }}>
                    No hay parqueos registrados.
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((p) => (
                  <tr key={p.id_parqueo}>
                    <td>{p.id_parqueo}</td>
                    <td><strong>{p.nombre_parqueo}</strong></td>
                    <td>{p.nombre_estacion}</td>
                    <td>{p.nombre_municipalidad}</td>
                    <td style={{ maxWidth: '220px', color: '#4b5563' }}>{p.descripcion || '-'}</td>
                    <td><strong>{p.capacidad_unidades}</strong> buses</td>
                    <td>
                      <span className={`badge-estado ${p.activo ? 'activo' : 'inactivo'}`}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="acciones-celda">
                      <button type="button" onClick={() => abrirEditar(p)} className="btn-secundario">
                        Editar
                      </button>
                      <button type="button" onClick={() => handleToggleEstado(p)} className="btn-estado">
                        {p.activo ? 'Desactivar' : 'Activar'}
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
          <div className="modal-caja" style={{ maxWidth: '500px' }}>
            <div className="modal-cabecera">
              <h3>{editandoId ? 'Editar Parqueo' : 'Registrar Parqueo'}</h3>
              <button type="button" onClick={() => setModalAbierto(false)} className="modal-cerrar">×</button>
            </div>

            {error && <div className="modulo-alerta-error">{error}</div>}

            <form onSubmit={handleGuardar} className="modal-form">
              <div className="form-grupo">
                <label>Nombre del Parqueo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Patio Sur / Parqueo Estación 1"
                  value={formData.nombre_parqueo}
                  onChange={(e) => setFormData({ ...formData, nombre_parqueo: e.target.value })}
                />
              </div>

              <div className="form-grupo">
                <label>Estación *</label>
                <select
                  required
                  value={formData.id_estacion}
                  onChange={(e) => setFormData({ ...formData, id_estacion: e.target.value })}
                >
                  <option value="">-- Seleccione una estación --</option>
                  {estaciones.map((est) => (
                    <option key={est.id_estacion} value={est.id_estacion}>
                      {est.nombre_estacion} ({est.nombre_municipalidad})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grupo">
                <label>Capacidad de Unidades (Buses) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.capacidad_unidades}
                  onChange={(e) => setFormData({ ...formData, capacidad_unidades: e.target.value })}
                />
              </div>

              <div className="form-grupo">
                <label>Ubicación / Descripción</label>
                <textarea
                  rows="3"
                  placeholder="Ej. Costado norte de la estación, ingreso sobre calzada principal..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
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