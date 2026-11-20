import React, { useState, useEffect } from 'react';
import { operadorEstacionServicio } from '../../servicios/operadorEstacionServicio';
import '../ModuloAdmin.css';

export const OperadoresEstacion = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [operadoresLibres, setOperadoresLibres] = useState([]);
  const [estacionesLibres, setEstacionesLibres] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [formData, setFormData] = useState({
    id_empleado_operador: '',
    id_estacion: '',
  });

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const data = await operadorEstacionServicio.listar();
      setAsignaciones(data.asignaciones || []);
      setOperadoresLibres(data.operadoresDisponibles || []);
      setEstacionesLibres(data.estacionesDisponibles || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirModal = () => {
    setFormData({
      id_empleado_operador: operadoresLibres[0]?.id_empleado || '',
      id_estacion: estacionesLibres[0]?.id_estacion || '',
    });
    setError('');
    setModalAbierto(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await operadorEstacionServicio.asignar(formData);
      setModalAbierto(false);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLiberar = async (id) => {
    try {
      await operadorEstacionServicio.liberar(id);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const listaFiltrada = asignaciones.filter(
    (a) =>
      a.nombre_operador.toLowerCase().includes(filtro.toLowerCase()) ||
      a.dpi.includes(filtro) ||
      (a.nombre_usuario || '').toLowerCase().includes(filtro.toLowerCase()) ||
      a.nombre_estacion.toLowerCase().includes(filtro.toLowerCase()) ||
      a.nombre_municipalidad.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="modulo-card">
      <div className="modulo-toolbar">
        <input
          type="text"
          placeholder="Buscar operador, usuario, DPI o estación..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="modulo-input-buscar"
        />
        <button type="button" onClick={abrirModal} className="btn-primario">
          + Asignar Operador a Estación
        </button>
      </div>

      {error && !modalAbierto && <div className="modulo-alerta-error">{error}</div>}

      {cargando ? (
        <p>Cargando asignaciones...</p>
      ) : (
        <div className="tabla-contenedor">
          <table className="modulo-tabla">
            <thead>
              <tr>
                <th>Operador de Estación</th>
                <th>Usuario</th>
                <th>DPI</th>
                <th>Estación Asignada</th>
                <th>Municipalidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#6b7280' }}>
                    No hay operadores asignados a estaciones.
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((a) => (
                  <tr key={a.id_operador_estacion}>
                    <td><strong>{a.nombre_operador}</strong></td>
                    <td>{a.nombre_usuario || '-'}</td>
                    <td>{a.dpi}</td>
                    <td><strong>{a.nombre_estacion}</strong></td>
                    <td>{a.nombre_municipalidad}</td>
                    <td>
                      <span className={`badge-estado ${a.activo ? 'activo' : 'inactivo'}`}>
                        {a.activo ? 'Asignado' : 'Liberado'}
                      </span>
                    </td>
                    <td className="acciones-celda">
                      {a.activo ? (
                        <button
                          type="button"
                          onClick={() => handleLiberar(a.id_operador_estacion)}
                          className="btn-estado"
                        >
                          Liberar
                        </button>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>Histórico</span>
                      )}
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
              <h3>Asignar Operador a Estación</h3>
              <button type="button" onClick={() => setModalAbierto(false)} className="modal-cerrar">×</button>
            </div>

            {error && <div className="modulo-alerta-error">{error}</div>}

            <form onSubmit={handleGuardar} className="modal-form">
              <div className="form-grupo">
                <label>Operador Disponible con Usuario ({operadoresLibres.length}) *</label>
                <select
                  required
                  value={formData.id_empleado_operador}
                  onChange={(e) => setFormData({ ...formData, id_empleado_operador: e.target.value })}
                >
                  <option value="">-- Seleccione un operador --</option>
                  {operadoresLibres.map((op) => (
                    <option key={op.id_empleado} value={op.id_empleado}>
                      {op.nombre} {op.apellido} — Usuario: {op.nombre_usuario} (DPI: {op.dpi})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grupo">
                <label>Estación Disponible ({estacionesLibres.length}) *</label>
                <select
                  required
                  value={formData.id_estacion}
                  onChange={(e) => setFormData({ ...formData, id_estacion: e.target.value })}
                >
                  <option value="">-- Seleccione una estación --</option>
                  {estacionesLibres.map((est) => (
                    <option key={est.id_estacion} value={est.id_estacion}>
                      {est.nombre_estacion} ({est.nombre_municipalidad})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-pie">
                <button type="button" onClick={() => setModalAbierto(false)} className="btn-secundario">
                  Cancelar
                </button>
                <button type="submit" className="btn-primario">
                  Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};