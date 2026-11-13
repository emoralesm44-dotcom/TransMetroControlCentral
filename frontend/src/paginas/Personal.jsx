import React, { useState, useEffect } from 'react';
import { empleadoServicio } from '../servicios/empleadoServicios';
import '../paginas/ModuloAdmin.css';

const TIPOS_PERSONAL = [
  { valor: 'PILOTO', etiqueta: 'Piloto' },
  { valor: 'OPERADOR_ESTACION', etiqueta: 'Operador de Estación' },
  { valor: 'GUARDIA', etiqueta: 'Guardia de Seguridad' },
  { valor: 'SUPERVISOR', etiqueta: 'Supervisor' },
  { valor: 'ADMINISTRADOR', etiqueta: 'Administrador' },
];

const FORM_INICIAL = {
  nombre: '',
  apellido: '',
  dpi: '',
  telefono: '',
  direccion_residencia: '',
  historial_educativo: '',
  tipo_personal: 'PILOTO',
  fecha_contratacion: new Date().toISOString().split('T')[0],
  activo: true,
};

export const Personal = () => {
  const [lista, setLista] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState(FORM_INICIAL);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const data = await empleadoServicio.listar();
      setLista(data.empleados || []);
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
    setFormData(FORM_INICIAL);
    setError('');
    setModalAbierto(true);
  };

  const abrirEditar = (emp) => {
    setEditandoId(emp.id_empleado);
    setFormData({
      nombre: emp.nombre,
      apellido: emp.apellido,
      dpi: emp.dpi,
      telefono: emp.telefono || '',
      direccion_residencia: emp.direccion_residencia || '',
      historial_educativo: emp.historial_educativo || '',
      tipo_personal: emp.tipo_personal,
      fecha_contratacion: emp.fecha_contratacion || '',
      activo: emp.activo,
    });
    setError('');
    setModalAbierto(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editandoId) {
        await empleadoServicio.actualizar(editandoId, formData);
      } else {
        await empleadoServicio.crear(formData);
      }
      setModalAbierto(false);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleEstado = async (emp) => {
    try {
      await empleadoServicio.cambiarEstado(emp.id_empleado, !emp.activo);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const listaFiltrada = lista.filter((emp) => {
    const coincideTexto =
      `${emp.nombre} ${emp.apellido}`.toLowerCase().includes(filtro.toLowerCase()) ||
      emp.dpi.includes(filtro);
    const coincideTipo = filtroTipo ? emp.tipo_personal === filtroTipo : true;
    return coincideTexto && coincideTipo;
  });

  return (
    <div className="modulo-card">
      <div className="modulo-toolbar">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Buscar por nombre o DPI..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="modulo-input-buscar"
          />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="modulo-input-buscar"
            style={{ minWidth: '180px' }}
          >
            <option value="">Todos los puestos</option>
            {TIPOS_PERSONAL.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.etiqueta}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={abrirNuevo} className="btn-primario">
          + Registrar Personal
        </button>
      </div>

      {error && !modalAbierto && <div className="modulo-alerta-error">{error}</div>}

      {cargando ? (
        <p>Cargando personal...</p>
      ) : (
        <div className="tabla-contenedor">
          <table className="modulo-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Completo</th>
                <th>DPI</th>
                <th>Teléfono</th>
                <th>Puesto</th>
                <th>Contratación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: '#6b7280' }}>
                    No hay registros de personal.
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((emp) => (
                  <tr key={emp.id_empleado}>
                    <td>{emp.id_empleado}</td>
                    <td>{emp.nombre} {emp.apellido}</td>
                    <td>{emp.dpi}</td>
                    <td>{emp.telefono || '-'}</td>
                    <td>{emp.tipo_personal}</td>
                    <td>{emp.fecha_contratacion}</td>
                    <td>
                      <span className={`badge-estado ${emp.activo ? 'activo' : 'inactivo'}`}>
                        {emp.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="acciones-celda">
                      <button
                        type="button"
                        onClick={() => abrirEditar(emp)}
                        className="btn-secundario"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleEstado(emp)}
                        className="btn-estado"
                      >
                        {emp.activo ? 'Desactivar' : 'Activar'}
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
          <div className="modal-caja" style={{ maxWidth: '580px' }}>
            <div className="modal-cabecera">
              <h3>{editandoId ? 'Editar Personal' : 'Registrar Personal'}</h3>
              <button type="button" onClick={() => setModalAbierto(false)} className="modal-cerrar">
                ×
              </button>
            </div>

            {error && <div className="modulo-alerta-error">{error}</div>}

            <form onSubmit={handleGuardar} className="modal-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-grupo">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>

                <div className="form-grupo">
                  <label>Apellido *</label>
                  <input
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  />
                </div>

                <div className="form-grupo">
                  <label>DPI (13 dígitos) *</label>
                  <input
                    type="text"
                    required
                    maxLength={13}
                    placeholder="Ej. 3890219112101"
                    value={formData.dpi}
                    onChange={(e) => setFormData({ ...formData, dpi: e.target.value })}
                  />
                </div>

                <div className="form-grupo">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    placeholder="Ej. 4532-1454"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>

                <div className="form-grupo">
                  <label>Tipo de Personal *</label>
                  <select
                    value={formData.tipo_personal}
                    onChange={(e) => setFormData({ ...formData, tipo_personal: e.target.value })}
                  >
                    {TIPOS_PERSONAL.map((t) => (
                      <option key={t.valor} value={t.valor}>
                        {t.etiqueta}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-grupo">
                  <label>Fecha de Contratación</label>
                  <input
                    type="date"
                    value={formData.fecha_contratacion}
                    onChange={(e) => setFormData({ ...formData, fecha_contratacion: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grupo">
                <label>Dirección de Residencia</label>
                <input
                  type="text"
                  value={formData.direccion_residencia}
                  onChange={(e) => setFormData({ ...formData, direccion_residencia: e.target.value })}
                />
              </div>

              <div className="form-grupo">
                <label>Historial Educativo</label>
                <textarea
                  rows="3"
                  placeholder="Estudios realizados, licencias o certificaciones..."
                  value={formData.historial_educativo}
                  onChange={(e) => setFormData({ ...formData, historial_educativo: e.target.value })}
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