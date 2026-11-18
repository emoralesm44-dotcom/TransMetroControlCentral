import React, { useState, useEffect } from 'react';
import { terminalOperadorServicio } from '../../servicios/terminalOperadorServicio';

const fechaLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export const RegistrarSalida = ({ recorrido, onSalidaRegistrada }) => {
  const [segundos, setSegundos] = useState(0);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ hora_salida: fechaLocal(), observacion_salida: '' });
  const [error, setError] = useState('');

  const pct = recorrido?.capacidad_maxima > 0 ? Math.round((recorrido.pasajeros / recorrido.capacidad_maxima) * 100) : 0;
  const esSobrecupo = pct >= 150;
  const esBaja = pct < 25;

  useEffect(() => {
    setMostrarForm(false);
    setError('');
    if (!recorrido || !esBaja) return setSegundos(0);

    const transcurridos = Math.floor((Date.now() - new Date(recorrido.hora_llegada).getTime()) / 1000);
    const restantes = Math.max(300 - Math.max(0, transcurridos), 0);
    setSegundos(restantes);

    if (restantes === 0) return;
    const timer = setInterval(() => setSegundos((prev) => (prev <= 1 ? (clearInterval(timer), 0) : prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [recorrido?.id_recorrido, esBaja]);

  if (!recorrido) {
    return (
      <div style={{ padding: '24px', border: '1px dashed #d1d5db', borderRadius: '8px', color: '#6b7280', textAlign: 'center' }}>
        Registre la llegada de un bus para evaluar la ocupación y habilitar su salida.
      </div>
    );
  }

  const salidaHabilitada = !esBaja || segundos === 0;
  const min = String(Math.floor(segundos / 60)).padStart(2, '0');
  const seg = String(segundos % 60).padStart(2, '0');

  const confirmarSalida = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await terminalOperadorServicio.guardarSalida(recorrido.id_recorrido, form);
      setMostrarForm(false);
      onSalidaRegistrada();
    } catch (err) {
      setError(err.message);
    }
  };

  const estilosAlerta = {
    normal: { bg: '#ecfdf5', color: '#065f46', texto: `OCUPACIÓN NORMAL (${pct}%). Bus listo para registrar salida.` },
    baja: { bg: '#fffbeb', color: '#92400e', texto: `ALERTA DE BAJA OCUPACIÓN (${pct}%): Esperar cinco minutos adicionales antes de salir.` },
    sobrecupo: { bg: '#fef2f2', color: '#991b1b', texto: `ALERTA DE SOBRECUPO (${pct}%): Se solicitará un nuevo bus por sobrecupo.` }
  };
  const tipoAlerta = esSobrecupo ? estilosAlerta.sobrecupo : esBaja ? estilosAlerta.baja : estilosAlerta.normal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {error && <div className="modulo-alerta-error">{error}</div>}
      <div style={{ padding: '14px', borderRadius: '8px', background: tipoAlerta.bg, color: tipoAlerta.color, fontWeight: 600 }}>
        {tipoAlerta.texto}
      </div>

      {esBaja && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '20px', fontWeight: 600 }}>
            Contador 5 minutos: <span style={{ fontFamily: 'monospace' }}>{min}:{seg}</span>
          </div>
          {segundos > 0 && (
            <button type="button" className="btn-secundario" onClick={() => setSegundos(0)}>Omitir 5 minutos</button>
          )}
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <button
          type="button"
          className="btn-primario"
          disabled={!salidaHabilitada}
          style={{ opacity: salidaHabilitada ? 1 : 0.5, cursor: salidaHabilitada ? 'pointer' : 'not-allowed' }}
          onClick={() => { setMostrarForm(true); setForm({ hora_salida: fechaLocal(), observacion_salida: '' }); }}
        >
          Registrar salida
        </button>
      </div>

      {mostrarForm && salidaHabilitada && (
        <form onSubmit={confirmarSalida} className="modal-form" style={{ padding: '16px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 8px 0' }}>Recorrido elegido: {recorrido.codigo_unidad} — {recorrido.nombre_linea}</h4>
          <div className="form-grupo">
            <label>Hora de salida *</label>
            <input type="datetime-local" required value={form.hora_salida} onChange={(e) => setForm({ ...form, hora_salida: e.target.value })} />
          </div>
          <div className="form-grupo">
            <label>Observación de salida</label>
            <input type="text" value={form.observacion_salida} onChange={(e) => setForm({ ...form, observacion_salida: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn-primario">Confirmar salida</button>
            <button type="button" className="btn-secundario" onClick={() => setMostrarForm(false)}>Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
};