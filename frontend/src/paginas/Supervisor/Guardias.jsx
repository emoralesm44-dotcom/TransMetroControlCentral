import React, { useState, useEffect } from 'react';
import { guardiaServicio } from '../../servicios/guardiaServicio';
import '../ModuloAdmin.css';

export const Guardias = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [disponibles, setDisponibles] = useState([]);
  const [accesos, setAccesos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [estacionSeleccionada, setEstacionSeleccionada] = useState('');
  const [formData, setFormData] = useState({
    id_acceso: '',
    id_empleado_guardia: '',
  });

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const data = await guardiaServicio.listar();
      setAsignaciones(data.asignaciones || []);
      setDisponibles(data.disponibles || []);
      setAccesos(data.accesos || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const estacionesUnicas = Array.from(
    new Map(accesos.map((a) => [a.id_estacion, { id: a.id_estacion, nombre: a.nombre_estacion }])).values()
  );

  const accesosFiltradosPorEstacion = estacionSeleccionada
    ? accesos.filter((a) => String(a.id_estacion) === String(estacionSeleccionada))
    : accesos;

  const handleAsignar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await guardiaServicio.asignar(formData);
      setFormData({ id_acceso: '', id_empleado_guardia: '' });
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLiberar = async (id) => {
    setError('');
    try {
      await guardiaServicio.liberar(id);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const listaFiltrada = asignaciones.filter(
    (a) =>
      a.nombre_guardia.toLowerCase().includes(filtro.toLowerCase()) ||
      a.dpi.includes(filtro) ||
      a.nombre_estacion.toLowerCase().includes(filtro.toLowerCase()) ||
      a.nombre_acceso.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="modulo-card">
      <form
        onSubmit={handleAsignar}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
          padding: '14px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <div className="form-grupo" style={{ margin: 0 }}>
          <label>1. Filtrar Estación</label>
          <select
            value={estacionSeleccionada}
            onChange={(e) => {
              setEstacionSeleccionada(e.target.value);
              setFormData({ ...formData, id_acceso: '' });
            }}
          >
            <option value="">Todas las estaciones</option>
            {estacionesUnicas.map((est) => (
              <option key={est.id} value={est.id}>
                {est.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-grupo" style={{ margin: 0 }}>
          <label>2. Acceso de Estación *</label>
          <select
            required
            value={formData.id_acceso}
            onChange={(e) => setFormData({ ...formData, id_acceso: e.target.value })}
          >
            <option value="">-- Seleccione acceso --</option>
            {accesosFiltradosPorEstacion.map((acc) => (
              <option key={acc.id_acceso} value={acc.id_acceso}>
                {acc.nombre_estacion} — {acc.nombre_acceso} ({acc.guardias_asignados} guardias)
              </option>
            ))}
          </select>
        </div>

        <div className="form-grupo" style={{ margin: 0 }}>
          <label>3. Guardia Disponible ({disponibles.length}) *</label>
          <select
            required
            value={formData.id_empleado_guardia}
            onChange={(e) => setFormData({ ...formData, id_empleado_guardia: e.target.value })}
          >
            <option value="">-- Seleccione guardia libre --</option>
            {disponibles.map((g) => (
              <option key={g.id_empleado} value={g.id_empleado}>
                {g.nombre} {g.apellido} (DPI: {g.dpi})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            type="submit"
            className="btn-primario"
            style={{ width: '100%' }}
            disabled={disponibles.length === 0}
          >
            + Asignar Guardia
          </button>
        </div>
      </form>

      <div className="modulo-toolbar">
        <input
          type="text"
          placeholder="Buscar por guardia, DPI, estación o acceso..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="modulo-input-buscar"
        />
        <span style={{ fontSize: '13px', color: '#4b5563' }}>
          Asignados: <strong>{asignaciones.length}</strong> · Libres: <strong>{disponibles.length}</strong>
        </span>
      </div>

      {error && <div className="modulo-alerta-error">{error}</div>}

      {cargando ? (
        <p>Cargando asignaciones de guardias...</p>
      ) : (
        <div className="tabla-contenedor">
          <table className="modulo-tabla">
            <thead>
              <tr>
                <th>Guardia</th>
                <th>DPI</th>
                <th>Estación</th>
                <th>Acceso Asignado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#6b7280' }}>
                    No hay guardias asignados actualmente.
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((asig) => (
                  <tr key={asig.id_acceso_guardia}>
                    <td><strong>{asig.nombre_guardia}</strong></td>
                    <td>{asig.dpi}</td>
                    <td>{asig.nombre_estacion}</td>
                    <td>{asig.nombre_acceso}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleLiberar(asig.id_acceso_guardia)}
                        className="btn-estado"
                      >
                        Liberar Guardia
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};