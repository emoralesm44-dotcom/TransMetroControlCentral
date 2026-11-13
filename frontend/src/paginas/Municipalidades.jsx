import React, { useState, useEffect } from 'react';
import { municipalidadServicio } from '../servicios/municipalidadServicios';
import '../paginas/ModuloAdmin.css';

export const Municipalidades = () => {
  const [lista, setLista] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    departamento: 'Guatemala',
    activo: true,
  });

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const data = await municipalidadServicio.listar();
      setLista(data.municipalidades || []);
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
    setFormData({ nombre: '', departamento: 'Guatemala', activo: true });
    setError('');
    setModalAbierto(true);
  };

  const abrirEditar = (muni) => {
    setEditandoId(muni.id_municipalidad);
    setFormData({
      nombre: muni.nombre,
      departamento: muni.departamento || 'Guatemala',
      activo: muni.activo,
    });
    setError('');
    setModalAbierto(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editandoId) {
        await municipalidadServicio.actualizar(editandoId, formData);
      } else {
        await municipalidadServicio.crear(formData);
      }
      setModalAbierto(false);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleEstado = async (muni) => {
    try {
      await municipalidadServicio.cambiarEstado(muni.id_municipalidad, !muni.activo);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const listaFiltrada = lista.filter(
    (m) =>
      m.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      (m.departamento || '').toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="modulo-card">
      <div className="modulo-toolbar">
        <input
          type="text"
          placeholder="Buscar municipalidad o departamento..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="modulo-input-buscar"
        />
        <button type="button" onClick={abrirNuevo} className="btn-primario">
          + Nueva Municipalidad
        </button>
      </div>

      {error && !modalAbierto && <div className="modulo-alerta-error">{error}</div>}

      {cargando ? (
        <p>Cargando registros...</p>
      ) : (
        <div className="tabla-contenedor">
          <table className="modulo-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre de Municipalidad</th>
                <th>Departamento</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#6b7280' }}>
                    No hay municipalidades registradas.
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((muni) => (
                  <tr key={muni.id_municipalidad}>
                    <td>{muni.id_municipalidad}</td>
                    <td>{muni.nombre}</td>
                    <td>{muni.departamento}</td>
                    <td>
                      <span className={`badge-estado ${muni.activo ? 'activo' : 'inactivo'}`}>
                        {muni.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="acciones-celda">
                      <button
                        type="button"
                        onClick={() => abrirEditar(muni)}
                        className="btn-secundario"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleEstado(muni)}
                        className="btn-estado"
                      >
                        {muni.activo ? 'Desactivar' : 'Activar'}
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
              <h3>{editandoId ? 'Editar Municipalidad' : 'Nueva Municipalidad'}</h3>
              <button type="button" onClick={() => setModalAbierto(false)} className="modal-cerrar">
                ×
              </button>
            </div>

            {error && <div className="modulo-alerta-error">{error}</div>}

            <form onSubmit={handleGuardar} className="modal-form">
              <div className="form-grupo">
                <label>Nombre *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Municipalidad de Guatemala"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>

              <div className="form-grupo">
                <label>Departamento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Guatemala"
                  value={formData.departamento}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                />
              </div>

              <div className="form-grupo">
                <label>Estado</label>
                <select
                  value={formData.activo ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
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