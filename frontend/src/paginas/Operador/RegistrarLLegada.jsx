import React, { useState } from 'react';
import { terminalOperadorServicio } from '../../servicios/terminalOperadorServicio';

const fechaLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export const RegistrarLlegada = ({ estacion, lineas, buses, bloqueado, onLlegadaGuardada }) => {
  const initialForm = { id_linea: '', id_bus: '', pasajeros: '', hora_llegada: fechaLocal(), observacion: '' };
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  const updateForm = (k, v) => setForm((prev) => ({ ...prev, [k]: v, ...(k === 'id_linea' && { id_bus: '' }) }));
  const busSel = buses.find((b) => String(b.id_bus) === String(form.id_bus));

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await terminalOperadorServicio.guardarLlegada(form);
      setForm(initialForm);
      onLlegadaGuardada();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Registrar Llegada de Bus</h3>
      {error && <div className="modulo-alerta-error">{error}</div>}
      <form onSubmit={guardar} className="modal-form">
        <div className="form-grupo"><label>Estación asignada</label><input type="text" value={estacion.nombre_estacion} disabled /></div>
        <div className="form-grupo">
          <label>Línea *</label>
          <select required disabled={bloqueado} value={form.id_linea} onChange={(e) => updateForm('id_linea', e.target.value)}>
            <option value="">-- Seleccione una línea --</option>
            {lineas.map((l) => <option key={l.id_linea} value={l.id_linea}>{l.nombre_linea}</option>)}
          </select>
        </div>
        <div className="form-grupo">
          <label>Bus activo de la línea *</label>
          <select required disabled={bloqueado || !form.id_linea} value={form.id_bus} onChange={(e) => updateForm('id_bus', e.target.value)}>
            <option value="">-- Seleccione un bus --</option>
            {buses.filter((b) => String(b.id_linea) === String(form.id_linea)).map((b) => <option key={b.id_bus} value={b.id_bus}>{b.codigo_unidad} ({b.placa})</option>)}
          </select>
        </div>
        <div className="form-grupo"><label>Capacidad del bus</label><input type="text" value={busSel ? `${busSel.capacidad_maxima} pasajeros` : 'Seleccione un bus'} disabled /></div>
        <div className="form-grupo"><label>Cantidad de pasajeros a abordar *</label><input type="number" min="0" required disabled={bloqueado} value={form.pasajeros} onChange={(e) => updateForm('pasajeros', e.target.value)} /></div>
        <div className="form-grupo"><label>Hora de llegada *</label><input type="datetime-local" required disabled={bloqueado} value={form.hora_llegada} onChange={(e) => updateForm('hora_llegada', e.target.value)} /></div>
        <div className="form-grupo"><label>Observación</label><input type="text" disabled={bloqueado} value={form.observacion} onChange={(e) => updateForm('observacion', e.target.value)} /></div>
        <div><button type="submit" className="btn-primario" disabled={bloqueado}>Guardar llegada</button></div>
      </form>
    </div>
  );
};