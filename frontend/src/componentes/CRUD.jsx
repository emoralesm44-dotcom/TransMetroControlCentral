import React, { useEffect, useState } from 'react';
import '../paginas/ModuloAdmin.css';

const CRUD = ({
  titulo,
  servicio,
  identificador,
  propiedadLista,
  columnas,
  campos,
  inicial,
  textoBoton = 'Nuevo registro',
  placeholder = 'Buscar registros...',
  mensajeVacio = 'No hay registros.',
  filtros = [],
  buscar,
  anchoModal,
  columnasFormulario = 1,
}) => {
  const [lista, setLista] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [valoresFiltros, setValoresFiltros] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({ ...inicial });

  const ejecutarAccion = async (operacion, limpiarError = true) => {
    if (limpiarError) setError('');
    try {
      return await operacion();
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const cargarDatos = async () => {
    setCargando(true);
    const respuesta = await ejecutarAccion(() => servicio.listar());
    if (respuesta) setLista(respuesta[propiedadLista] || []);
    setCargando(false);
  };

  useEffect(() => { cargarDatos(); }, []);

  const abrirModal = (registro = null) => {
    setEditandoId(registro ? registro[identificador] : null);
    setFormData(registro ? { ...inicial, ...registro } : { ...inicial });
    setError('');
    setModalAbierto(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (guardando) return;
    setGuardando(true);
    
    const exito = await ejecutarAccion(async () => {
      if (editandoId !== null) {
        await servicio.actualizar(editandoId, formData);
      } else {
        await servicio.crear(formData);
      }
      setModalAbierto(false);
      await cargarDatos();
    }, false);

    if (!exito) setGuardando(false);
    else setGuardando(false);
  };

  const cambiarEstado = async (registro) => {
    await ejecutarAccion(async () => {
      await servicio.cambiarEstado(registro[identificador], !registro.activo);
      await cargarDatos();
    });
  };

  const listaFiltrada = lista.filter((registro) => {
    const coincideTexto = buscar
      ? buscar(registro, filtro)
      : columnas.some((c) => String(registro[c.campo] ?? '').toLowerCase().includes(filtro.toLowerCase()));

    const coincideFiltros = filtros.every((f) => {
      const sel = valoresFiltros[f.nombre] || '';
      return !sel || String(registro[f.campo]) === String(sel);
    });

    return coincideTexto && coincideFiltros;
  });

  const cambiarCampo = (nombre, valor, tipo) => {
    setFormData((act) => ({ ...act, [nombre]: tipo === 'boolean' ? valor === 'true' : valor }));
  };

  const renderCampo = (campo) => {
    const valor = formData[campo.nombre] ?? '';
    const propsComunes = {
      required: campo.requerido,
      placeholder: campo.placeholder || '',
      value: campo.tipo === 'boolean' ? String(valor) : valor,
      onChange: (e) => cambiarCampo(campo.nombre, e.target.value, campo.tipo)
    };

    return (
      <div className="form-grupo" key={campo.nombre} style={{ gridColumn: campo.anchoCompleto ? '1 / -1' : 'auto' }}>
        <label>{campo.etiqueta} {campo.requerido ? '*' : ''}</label>
        {campo.tipo === 'textarea' ? (
          <textarea rows={campo.filas || 3} {...propsComunes} />
        ) : campo.tipo === 'select' || campo.tipo === 'boolean' ? (
          <select {...propsComunes}>
            {campo.opciones?.map((o) => (<option key={o.valor} value={o.valor}>{o.etiqueta}</option>))}
            {campo.tipo === 'boolean' && (<><option value="true">Activo</option><option value="false">Inactivo</option></>)}
          </select>
        ) : (
          <input type={campo.tipo || 'text'} maxLength={campo.maxLength} {...propsComunes} />
        )}
      </div>
    );
  };

  return (
    <div className="modulo-card">
      {titulo && <h2>{titulo}</h2>}
      <div className="modulo-toolbar">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input type="text" placeholder={placeholder} value={filtro} onChange={(e) => setFiltro(e.target.value)} className="modulo-input-buscar" />
          {filtros.map((f) => (
            <select
              key={f.nombre}
              value={valoresFiltros[f.nombre] || ''}
              onChange={(e) => setValoresFiltros((act) => ({ ...act, [f.nombre]: e.target.value }))}
              className="modulo-input-buscar"
              style={{ minWidth: '180px' }}
            >
              <option value="">{f.etiquetaTodos}</option>
              {f.opciones.map((o) => (<option key={o.valor} value={o.valor}>{o.etiqueta}</option>))}
            </select>
          ))}
        </div>
        <button type="button" onClick={() => abrirModal()} className="btn-primario">+ {textoBoton}</button>
      </div>

      {error && !modalAbierto && <div className="modulo-alerta-error">{error}</div>}

      {cargando ? <p>Cargando registros...</p> : (
        <div className="tabla-contenedor">
          <table className="modulo-tabla">
            <thead>
              <tr>
                <th>ID</th>
                {columnas.map((c) => (<th key={c.campo}>{c.titulo}</th>))}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length === 0 ? (
                <tr><td colSpan={columnas.length + 2} style={{ textAlign: 'center', color: '#6b7280' }}>{mensajeVacio}</td></tr>
              ) : (
                listaFiltrada.map((r) => (
                  <tr key={r[identificador]}>
                    <td>{r[identificador]}</td>
                    {columnas.map((c) => (
                      <td key={c.campo}>
                        {c.tipo === 'estado' ? (
                          <span className={`badge-estado ${r[c.campo] ? 'activo' : 'inactivo'}`}>
                            {r[c.campo] ? 'Activo' : 'Inactivo'}
                          </span>
                        ) : c.render ? c.render(r) : (r[c.campo] ?? '-')}
                      </td>
                    ))}
                    <td className="acciones-celda">
                      <button type="button" className="btn-secundario" onClick={() => abrirModal(r)}>Editar</button>
                      <button type="button" className="btn-estado" onClick={() => cambiarEstado(r)}>{r.activo ? 'Desactivar' : 'Activar'}</button>
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
          <div className="modal-caja" style={anchoModal ? { maxWidth: anchoModal } : undefined}>
            <div className="modal-cabecera">
              <h3>{editandoId !== null ? `Editar ${titulo}` : `Nuevo ${titulo}`}</h3>
              <button type="button" onClick={() => setModalAbierto(false)} className="modal-cerrar">×</button>
            </div>
            {error && <div className="modulo-alerta-error">{error}</div>}
            <form onSubmit={guardar} className="modal-form">
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columnasFormulario}, minmax(0, 1fr))`, gap: '12px' }}>
                {campos.map(renderCampo)}
              </div>
              <div className="modal-pie">
                <button type="button" onClick={() => setModalAbierto(false)} className="btn-secundario" disabled={guardando}>Cancelar</button>
                <button type="submit" className="btn-primario" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRUD;