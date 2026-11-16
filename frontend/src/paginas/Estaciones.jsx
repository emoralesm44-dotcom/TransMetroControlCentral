import React, { useState, useEffect } from 'react';
import { estacionServicio } from '../servicios/estacionServicio';
import { municipalidadServicio } from '../servicios/municipalidadServicios';
import './ModuloAdmin.css';

export const Estaciones = () => {
  const [estaciones, setEstaciones] = useState([]);
  const [municipalidades, setMunicipalidades] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({ nombre_estacion: '', id_municipalidad: '' });
  const [accesos, setAccesos] = useState([]);
  const [nuevoAcceso, setNuevoAcceso] = useState({ nombre_acceso: '', descripcion: '' });

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [dataEst, dataMuni] = await Promise.all([
        estacionServicio.listar(),
        municipalidadServicio.listar(),
      ]);
      setEstaciones(dataEst.estaciones || []);
      setMunicipalidades((dataMuni.municipalidades || []).filter((m) => m.activo));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarAccesos = async (idEstacion) => {
    const data = await estacionServicio.listarAccesos(idEstacion);
    setAccesos(data.accesos || []);
  };

  const abrirNuevo = () => {
    setEditandoId(null);
    setFormData({
      nombre_estacion: '',
      id_municipalidad: municipalidades[0]?.id_municipalidad || '',
    });
    setAccesos([{ tempId: 1, nombre_acceso: 'Acceso 1', descripcion: '', activo: true }]);
    setNuevoAcceso({ nombre_acceso: '', descripcion: '' });
    setError('');
    setModalAbierto(true);
  };

  const abrirGestion = async (est) => {
    setEditandoId(est.id_estacion);
    setFormData({
      nombre_estacion: est.nombre_estacion,
      id_municipalidad: est.id_municipalidad,
    });
    setNuevoAcceso({ nombre_acceso: '', descripcion: '' });
    setError('');
    setModalAbierto(true);
    try {
      await cargarAccesos(est.id_estacion);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGuardarEstacion = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editandoId) {
        await estacionServicio.actualizar(editandoId, formData);
      } else {
        const accesosValidos = accesos.filter((a) => a.nombre_acceso.trim());
        if (accesosValidos.length === 0) {
          setError('Debe agregar al menos un acceso para la estación.');
          return;
        }
        const res = await estacionServicio.crear({ ...formData, cantidad_accesos: 1 });
        const idCreada = res.estacion?.id_estacion;
        if (idCreada) {
          const dataAcc = await estacionServicio.listarAccesos(idCreada);
          if (dataAcc.accesos?.[0]) {
            await estacionServicio.actualizarAcceso(dataAcc.accesos[0].id_acceso, {
              nombre_acceso: accesosValidos[0].nombre_acceso.trim(),
              descripcion: accesosValidos[0].descripcion?.trim() || '',
            });
          }
          for (let i = 1; i < accesosValidos.length; i++) {
            await estacionServicio.crearAcceso(idCreada, {
              nombre_acceso: accesosValidos[i].nombre_acceso.trim(),
              descripcion: accesosValidos[i].descripcion?.trim() || '',
            });
          }
        }
      }
      setModalAbierto(false);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAgregarAcceso = async () => {
    if (!nuevoAcceso.nombre_acceso.trim()) return;
    setError('');
    if (!editandoId) {
      setAccesos([
        ...accesos,
        {
          tempId: Date.now(),
          nombre_acceso: nuevoAcceso.nombre_acceso.trim(),
          descripcion: nuevoAcceso.descripcion.trim(),
          activo: true,
        },
      ]);
      setNuevoAcceso({ nombre_acceso: '', descripcion: '' });
      return;
    }

    try {
      await estacionServicio.crearAcceso(editandoId, nuevoAcceso);
      setNuevoAcceso({ nombre_acceso: '', descripcion: '' });
      await cargarAccesos(editandoId);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleActualizarAcceso = async (acc) => {
    if (!editandoId || !acc.nombre_acceso.trim()) return;
    try {
      await estacionServicio.actualizarAcceso(acc.id_acceso, {
        nombre_acceso: acc.nombre_acceso,
        descripcion: acc.descripcion || '',
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAccionAcceso = async (acc, idx) => {
    if (!editandoId) {
      setAccesos(accesos.filter((_, i) => i !== idx));
      return;
    }
    try {
      await estacionServicio.cambiarEstadoAcceso(acc.id_acceso, !acc.activo);
      await cargarAccesos(editandoId);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleEstado = async (est) => {
    try {
      await estacionServicio.cambiarEstado(est.id_estacion, !est.activo);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const listaFiltrada = estaciones.filter(
    (e) =>
      e.nombre_estacion.toLowerCase().includes(filtro.toLowerCase()) ||
      e.nombre_municipalidad.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="modulo-card">
      <div className="modulo-toolbar">
        <input
          type="text"
          placeholder="Buscar estación o municipalidad..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="modulo-input-buscar"
        />
        <button type="button" onClick={abrirNuevo} className="btn-primario">
          + Nueva Estación
        </button>
      </div>

      {error && !modalAbierto && <div className="modulo-alerta-error">{error}</div>}

      {cargando ? (
        <p>Cargando estaciones...</p>
      ) : (
        <div className="tabla-contenedor">
          <table className="modulo-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Estación</th>
                <th>Municipalidad</th>
                <th>Accesos Activos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#6b7280' }}>
                    No hay estaciones registradas.
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((est) => (
                  <tr key={est.id_estacion}>
                    <td>{est.id_estacion}</td>
                    <td><strong>{est.nombre_estacion}</strong></td>
                    <td>{est.nombre_municipalidad}</td>
                    <td>{est.total_accesos} accesos</td>
                    <td>
                      <span className={`badge-estado ${est.activo ? 'activo' : 'inactivo'}`}>
                        {est.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="acciones-celda">
                      <button type="button" onClick={() => abrirGestion(est)} className="btn-secundario">
                        Editar / Accesos
                      </button>
                      <button type="button" onClick={() => handleToggleEstado(est)} className="btn-estado">
                        {est.activo ? 'Desactivar' : 'Activar'}
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
          <div className="modal-caja" style={{ maxWidth: '720px', width: '95%', maxHeight: '88vh', overflowY: 'auto' }}>
            <div className="modal-cabecera">
              <h3>{editandoId ? 'Editar Estación y Accesos' : 'Nueva Estación y Accesos'}</h3>
              <button type="button" onClick={() => setModalAbierto(false)} className="modal-cerrar">×</button>
            </div>

            {error && <div className="modulo-alerta-error">{error}</div>}

            <form onSubmit={handleGuardarEstacion} className="modal-form">
              <div className="form-grupo">
                <label>Nombre de la Estación *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre_estacion}
                  onChange={(e) => setFormData({ ...formData, nombre_estacion: e.target.value })}
                />
              </div>

              <div className="form-grupo">
                <label>Municipalidad *</label>
                <select
                  required
                  value={formData.id_municipalidad}
                  onChange={(e) => setFormData({ ...formData, id_municipalidad: e.target.value })}
                >
                  <option value="">-- Seleccione --</option>
                  {municipalidades.map((m) => (
                    <option key={m.id_municipalidad} value={m.id_municipalidad}>
                      {m.nombre} ({m.departamento})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '4px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Accesos de la Estación
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr auto', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="Nombre (Ej. Acceso Norte)"
                    value={nuevoAcceso.nombre_acceso}
                    onChange={(e) => setNuevoAcceso({ ...nuevoAcceso, nombre_acceso: e.target.value })}
                    className="modulo-input-buscar"
                  />
                  <input
                    type="text"
                    placeholder="Descripción"
                    value={nuevoAcceso.descripcion}
                    onChange={(e) => setNuevoAcceso({ ...nuevoAcceso, descripcion: e.target.value })}
                    className="modulo-input-buscar"
                  />
                  <button type="button" onClick={handleAgregarAcceso} className="btn-primario" style={{ whiteSpace: 'nowrap' }}>
                    + Agregar
                  </button>
                </div>

                <table className="modulo-tabla" style={{ tableLayout: 'fixed', width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '32%' }}>Nombre</th>
                      <th style={{ width: '48%' }}>Descripción</th>
                      <th style={{ width: '20%' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accesos.map((acc, idx) => (
                      <tr key={acc.id_acceso || acc.tempId} style={{ opacity: acc.activo ? 1 : 0.55 }}>
                        <td>
                          <input
                            type="text"
                            value={acc.nombre_acceso}
                            onChange={(e) => {
                              const copia = [...accesos];
                              copia[idx].nombre_acceso = e.target.value;
                              setAccesos(copia);
                            }}
                            onBlur={() => handleActualizarAcceso(acc)}
                            className="modulo-input-buscar"
                            style={{ padding: '4px 8px', width: '100%' }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Descripción..."
                            value={acc.descripcion || ''}
                            onChange={(e) => {
                              const copia = [...accesos];
                              copia[idx].descripcion = e.target.value;
                              setAccesos(copia);
                            }}
                            onBlur={() => handleActualizarAcceso(acc)}
                            className="modulo-input-buscar"
                            style={{ padding: '4px 8px', width: '100%' }}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleAccionAcceso(acc, idx)}
                            className="btn-estado"
                            style={{ width: '100%' }}
                          >
                            {!editandoId ? 'Quitar' : acc.activo ? 'Desactivar' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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