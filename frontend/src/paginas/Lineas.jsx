import React, { useState, useEffect } from 'react';
import { lineaServicio } from '../servicios/lineaServicio';
import { municipalidadServicio } from '../servicios/municipalidadServicios';
import './ModuloAdmin.css';

export const Lineas = () => {
  const [lineas, setLineas] = useState([]);
  const [municipalidades, setMunicipalidades] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    codigo_linea: '',
    nombre_linea: '',
    descripcion: '',
    id_municipalidad: '',
    activo: true,
  });

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [dataLineas, dataMuni] = await Promise.all([
        lineaServicio.listar(),
        municipalidadServicio.listar(),
      ]);
      setLineas(dataLineas.lineas || []);
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

  const abrirNuevo = () => {
    setEditandoId(null);
    setFormData({
      codigo_linea: '',
      nombre_linea: '',
      descripcion: '',
      id_municipalidad: municipalidades[0]?.id_municipalidad || '',
      activo: true,
    });
    setError('');
    setModalAbierto(true);
  };

  const abrirEditar = (lin) => {
    setEditandoId(lin.id_linea);
    setFormData({
      codigo_linea: lin.codigo_linea || '',
      nombre_linea: lin.nombre_linea,
      descripcion: lin.descripcion || '',
      id_municipalidad: lin.id_municipalidad,
      activo: lin.activo,
    });
    setError('');
    setModalAbierto(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editandoId) {
        await lineaServicio.actualizar(editandoId, formData);
      } else {
        await lineaServicio.crear(formData);
      }
      setModalAbierto(false);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleEstado = async (lin) => {
    try {
      await lineaServicio.cambiarEstado(lin.id_linea, !lin.activo);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const listaFiltrada = lineas.filter(
    (l) =>
      (l.codigo_linea || '').toLowerCase().includes(filtro.toLowerCase()) ||
      l.nombre_linea.toLowerCase().includes(filtro.toLowerCase()) ||
      l.nombre_municipalidad.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="modulo-card">
      <div className="modulo-toolbar">
        <input
          type="text"
          placeholder="Buscar por código, línea o municipalidad..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="modulo-input-buscar"
        />
        <button type="button" onClick={abrirNuevo} className="btn-primario">
          + Nueva Línea
        </button>
      </div>

      {error && !modalAbierto && <div className="modulo-alerta-error">{error}</div>}

      {cargando ? (
        <p>Cargando líneas y rutas...</p>
      ) : (
        <div className="tabla-contenedor">
          <table className="modulo-tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre de Línea</th>
                <th>Descripción</th>
                <th>Municipalidad</th>
                <th>Estaciones</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#6b7280' }}>
                    No hay líneas registradas.
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((lin) => (
                  <tr key={lin.id_linea}>
                    <td><strong>{lin.codigo_linea || '-'}</strong></td>
                    <td>{lin.nombre_linea}</td>
                    <td style={{ maxWidth: '240px', color: '#4b5563' }}>
                      {lin.descripcion || '-'}
                    </td>
                    <td>{lin.nombre_municipalidad}</td>
                    <td>{lin.total_estaciones} estaciones</td>
                    <td>
                      <span className={`badge-estado ${lin.activo ? 'activo' : 'inactivo'}`}>
                        {lin.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="acciones-celda">
                      <button
                        type="button"
                        onClick={() => abrirEditar(lin)}
                        className="btn-secundario"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleEstado(lin)}
                        className="btn-estado"
                      >
                        {lin.activo ? 'Desactivar' : 'Activar'}
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
          <div className="modal-caja">
            <div className="modal-cabecera">
              <h3>{editandoId ? 'Editar Línea / Ruta' : 'Registrar Nueva Línea / Ruta'}</h3>
              <button type="button" onClick={() => setModalAbierto(false)} className="modal-cerrar">
                ×
              </button>
            </div>

            {error && <div className="modulo-alerta-error">{error}</div>}

            <form onSubmit={handleGuardar} className="modal-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div className="form-grupo">
                  <label>Código de Línea *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. L-12"
                    value={formData.codigo_linea}
                    onChange={(e) => setFormData({ ...formData, codigo_linea: e.target.value })}
                  />
                </div>

                <div className="form-grupo">
                  <label>Nombre de la Línea *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Centra Sur - Plaza Barrios"
                    value={formData.nombre_linea}
                    onChange={(e) => setFormData({ ...formData, nombre_linea: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grupo">
                <label>Municipalidad *</label>
                <select
                  required
                  value={formData.id_municipalidad}
                  onChange={(e) => setFormData({ ...formData, id_municipalidad: e.target.value })}
                >
                  <option value="">-- Seleccione una municipalidad --</option>
                  {municipalidades.map((m) => (
                    <option key={m.id_municipalidad} value={m.id_municipalidad}>
                      {m.nombre} ({m.departamento})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grupo">
                <label>Descripción de la Ruta</label>
                <textarea
                  rows="3"
                  placeholder="Detalle del recorrido, zonas que atraviesa u observaciones..."
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