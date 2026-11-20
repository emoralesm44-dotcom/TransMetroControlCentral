import React, { useState, useEffect, useMemo } from 'react';
import { usuarioServicio } from '../../servicios/usuariosServicio';
import { empleadoServicio } from '../../servicios/empleadoServicios';
import '../ModuloAdmin.css';

const ETIQUETAS_ROL = {
  ADMINISTRADOR: 'Administrador',
  SUPERVISOR: 'Supervisor',
  OPERADOR_ESTACION: 'Operador de Estación',
};

const FORM_INICIAL = { id_empleado: '', username: '', password: '', rol: '', activo: true };

const sugerirUsername = (nombre = '', apellido = '') =>
  `${nombre.trim().split(/\s+/)[0] || ''}.${apellido.trim().split(/\s+/)[0] || ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState(FORM_INICIAL);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [uRes, eRes] = await Promise.all([usuarioServicio.listar(), empleadoServicio.listar()]);
      setUsuarios(uRes.usuarios || []);
      setEmpleados(eRes.empleados || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const empleadosDisponibles = useMemo(() => {
    const ocupados = new Set(usuarios.map((u) => u.id_empleado));
    return empleados.filter(
      (e) => e.activo && Object.hasOwn(ETIQUETAS_ROL, e.tipo_personal) && !ocupados.has(e.id_empleado)
    );
  }, [usuarios, empleados]);

  const listaFiltrada = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    return usuarios.filter(
      (u) =>
        Object.hasOwn(ETIQUETAS_ROL, u.rol) &&
        (!filtroRol || u.rol === filtroRol) &&
        (!q ||
          u.username.toLowerCase().includes(q) ||
          u.nombre_empleado.toLowerCase().includes(q) ||
          u.dpi.includes(q))
    );
  }, [usuarios, filtro, filtroRol]);

  const setCampo = (campo, valor) => setFormData((prev) => ({ ...prev, [campo]: valor }));

  const handleSeleccionarEmpleado = (idEmp) => {
    const emp = empleadosDisponibles.find((e) => e.id_empleado === Number(idEmp));
    setFormData((prev) => ({
      ...prev,
      id_empleado: idEmp,
      username: emp ? sugerirUsername(emp.nombre, emp.apellido) : '',
      rol: emp ? emp.tipo_personal : '',
    }));
  };

  const abrirModal = (usr = null) => {
    setEditando(usr);
    setError('');
    setFormData(
      usr
        ? { id_empleado: usr.id_empleado, username: usr.username, password: '', rol: usr.rol, activo: usr.activo }
        : FORM_INICIAL
    );
    setModalAbierto(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');
    if (!Object.hasOwn(ETIQUETAS_ROL, formData.rol)) {
      setError('Solo se permite asignar usuario a Administrador, Supervisor u Operador de Estación.');
      return;
    }
    try {
      if (editando) await usuarioServicio.actualizar(editando.id_usuario, formData);
      else await usuarioServicio.crear(formData);
      setModalAbierto(false);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleEstado = async (usr) => {
    try {
      await usuarioServicio.cambiarEstado(usr.id_usuario, !usr.activo);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modulo-card">
      <div className="modulo-toolbar">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Buscar por usuario, empleado o DPI..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="modulo-input-buscar"
          />
          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className="modulo-input-buscar"
            style={{ minWidth: '180px' }}
          >
            <option value="">Todos los roles</option>
            {Object.entries(ETIQUETAS_ROL).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>{etiqueta}</option>
            ))}
          </select>
        </div>

        <button type="button" onClick={() => abrirModal()} className="btn-primario">
          + Nuevo Usuario
        </button>
      </div>

      {error && !modalAbierto && <div className="modulo-alerta-error">{error}</div>}

      {cargando ? (
        <p>Cargando usuarios...</p>
      ) : (
        <div className="tabla-contenedor">
          <table className="modulo-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Empleado Asignado</th>
                <th>DPI</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#6b7280' }}>
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((usr) => (
                  <tr key={usr.id_usuario}>
                    <td>{usr.id_usuario}</td>
                    <td><strong>{usr.username}</strong></td>
                    <td>{usr.nombre_empleado}</td>
                    <td>{usr.dpi}</td>
                    <td>{ETIQUETAS_ROL[usr.rol] || usr.rol}</td>
                    <td>
                      <span className={`badge-estado ${usr.activo ? 'activo' : 'inactivo'}`}>
                        {usr.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="acciones-celda">
                      <button type="button" onClick={() => abrirModal(usr)} className="btn-secundario">
                        Editar
                      </button>
                      <button type="button" onClick={() => handleToggleEstado(usr)} className="btn-estado">
                        {usr.activo ? 'Desactivar' : 'Activar'}
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
              <h3>{editando ? 'Editar Usuario' : 'Crear Usuario de Sistema'}</h3>
              <button type="button" onClick={() => setModalAbierto(false)} className="modal-cerrar">×</button>
            </div>

            {error && <div className="modulo-alerta-error">{error}</div>}

            <form onSubmit={handleGuardar} className="modal-form">
              <div className="form-grupo">
                <label>Empleado *</label>
                {editando ? (
                  <input type="text" disabled value={`${editando.nombre_empleado} (DPI: ${editando.dpi})`} />
                ) : (
                  <select required value={formData.id_empleado} onChange={(e) => handleSeleccionarEmpleado(e.target.value)}>
                    <option value="">-- Seleccione un empleado disponible --</option>
                    {empleadosDisponibles.map((emp) => (
                      <option key={emp.id_empleado} value={emp.id_empleado}>
                        {emp.nombre} {emp.apellido} — {ETIQUETAS_ROL[emp.tipo_personal]} (DPI: {emp.dpi})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-grupo">
                <label>Rol Asignado (según cargo en Personal) *</label>
                <input
                  type="text"
                  disabled
                  value={formData.rol ? (ETIQUETAS_ROL[formData.rol] || formData.rol) : 'Seleccione primero un empleado'}
                />
              </div>

              <div className="form-grupo">
                <label>Nombre de Usuario (Login) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. juan.perez"
                  value={formData.username}
                  onChange={(e) => setCampo('username', e.target.value)}
                />
              </div>

              <div className="form-grupo">
                <label>{editando ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña *'}</label>
                <input
                  type="password"
                  required={!editando}
                  placeholder={editando ? '••••••••' : 'Mínimo 6 caracteres'}
                  value={formData.password}
                  onChange={(e) => setCampo('password', e.target.value)}
                />
              </div>

              <div className="modal-pie">
                <button type="button" onClick={() => setModalAbierto(false)} className="btn-secundario">
                  Cancelar
                </button>
                <button type="submit" className="btn-primario">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};