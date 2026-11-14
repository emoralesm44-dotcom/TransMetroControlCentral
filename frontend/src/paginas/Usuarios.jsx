import React, { useState, useEffect } from 'react';
import { usuarioServicio } from '../servicios/usuariosServicio';
import { empleadoServicio } from '../servicios/empleadoServicios';
import './ModuloAdmin.css';

const ROLES_SISTEMA = [
  { valor: 'ADMINISTRADOR', etiqueta: 'Administrador' },
  { valor: 'SUPERVISOR', etiqueta: 'Supervisor' },
  { valor: 'PILOTO', etiqueta: 'Piloto' },
  { valor: 'OPERADOR_ESTACION', etiqueta: 'Operador de Estación' },
];

const FORM_INICIAL = {
  id_empleado: '',
  username: '',
  password: '',
  rol: 'SUPERVISOR',
  activo: true,
};

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [empleadoEditandoNombre, setEmpleadoEditandoNombre] = useState('');
  const [formData, setFormData] = useState(FORM_INICIAL);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [dataUsuarios, dataEmpleados] = await Promise.all([
        usuarioServicio.listar(),
        empleadoServicio.listar(),
      ]);
      setUsuarios(dataUsuarios.usuarios || []);
      setEmpleados(dataEmpleados.empleados || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const idsConUsuario = new Set(usuarios.map((u) => u.id_empleado));
  const empleadosDisponibles = empleados.filter(
    (emp) => emp.activo && !idsConUsuario.has(emp.id_empleado)
  );

  const handleSeleccionarEmpleado = (idEmp) => {
    const emp = empleadosDisponibles.find((e) => e.id_empleado === Number(idEmp));
    let usernameSugerido = '';
    let rolSugerido = 'SUPERVISOR';

    if (emp) {
      const primerNombre = emp.nombre.trim().split(' ')[0].toLowerCase();
      const primerApellido = emp.apellido.trim().split(' ')[0].toLowerCase();
      usernameSugerido = `${primerNombre}.${primerApellido}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      if (['ADMINISTRADOR', 'SUPERVISOR', 'PILOTO', 'OPERADOR_ESTACION'].includes(emp.tipo_personal)) {
        rolSugerido = emp.tipo_personal;
      }
    }

    setFormData({
      ...formData,
      id_empleado: idEmp,
      username: usernameSugerido,
      rol: rolSugerido,
    });
  };

  const abrirNuevo = () => {
    setEditandoId(null);
    setEmpleadoEditandoNombre('');
    setFormData(FORM_INICIAL);
    setError('');
    setModalAbierto(true);
  };

  const abrirEditar = (usr) => {
    setEditandoId(usr.id_usuario);
    setEmpleadoEditandoNombre(`${usr.nombre_empleado} (DPI: ${usr.dpi})`);
    setFormData({
      id_empleado: usr.id_empleado,
      username: usr.username,
      password: '',
      rol: usr.rol,
      activo: usr.activo,
    });
    setError('');
    setModalAbierto(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editandoId) {
        await usuarioServicio.actualizar(editandoId, formData);
      } else {
        await usuarioServicio.crear(formData);
      }
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

  const listaFiltrada = usuarios.filter((u) => {
    const coincideTexto =
      u.username.toLowerCase().includes(filtro.toLowerCase()) ||
      u.nombre_empleado.toLowerCase().includes(filtro.toLowerCase()) ||
      u.dpi.includes(filtro);
    const coincideRol = filtroRol ? u.rol === filtroRol : true;
    return coincideTexto && coincideRol;
  });

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
            {ROLES_SISTEMA.map((r) => (
              <option key={r.valor} value={r.valor}>
                {r.etiqueta}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={abrirNuevo} className="btn-primario">
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
                <th>Último Acceso</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: '#6b7280' }}>
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
                    <td>{usr.rol}</td>
                    <td>{usr.ultimo_acceso || 'Sin ingresos'}</td>
                    <td>
                      <span className={`badge-estado ${usr.activo ? 'activo' : 'inactivo'}`}>
                        {usr.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="acciones-celda">
                      <button
                        type="button"
                        onClick={() => abrirEditar(usr)}
                        className="btn-secundario"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleEstado(usr)}
                        className="btn-estado"
                      >
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
              <h3>{editandoId ? 'Editar Usuario' : 'Crear Usuario de Sistema'}</h3>
              <button type="button" onClick={() => setModalAbierto(false)} className="modal-cerrar">
                ×
              </button>
            </div>

            {error && <div className="modulo-alerta-error">{error}</div>}

            <form onSubmit={handleGuardar} className="modal-form">
              <div className="form-grupo">
                <label>Empleado *</label>
                {editandoId ? (
                  <input type="text" disabled value={empleadoEditandoNombre} />
                ) : (
                  <select
                    required
                    value={formData.id_empleado}
                    onChange={(e) => handleSeleccionarEmpleado(e.target.value)}
                  >
                    <option value="">-- Seleccione un empleado disponible --</option>
                    {empleadosDisponibles.map((emp) => (
                      <option key={emp.id_empleado} value={emp.id_empleado}>
                        {emp.nombre} {emp.apellido} — {emp.tipo_personal} (DPI: {emp.dpi})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-grupo">
                <label>Nombre de Usuario (Login) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. juan.perez"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div className="form-grupo">
                <label>
                  {editandoId ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña *'}
                </label>
                <input
                  type="password"
                  required={!editandoId}
                  placeholder={editandoId ? '••••••••' : 'Mínimo 6 caracteres'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="form-grupo">
                <label>Rol en el Sistema *</label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                >
                  {ROLES_SISTEMA.map((r) => (
                    <option key={r.valor} value={r.valor}>
                      {r.etiqueta}
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