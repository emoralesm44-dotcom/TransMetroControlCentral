import React, { useState, useEffect } from 'react';
import { terminalOperadorServicio } from '../../servicios/terminalOperadorServicio';
import { RegistrarLlegada } from './RegistrarLLegada';
import { RegistrarSalida } from './RegistrarSalida';
import '../ModuloAdmin.css';

export const ControlLlegadaSalida = () => {
  const [info, setInfo] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const cargar = () => terminalOperadorServicio.obtenerDatosLlegada().then(setInfo);

  useEffect(() => { cargar(); }, []);

  if (!info) return <div className="modulo-card"><p>Cargando...</p></div>;
  if (info.pendiente || !info.estacion) {
    return <div className="modulo-card"><div className="modulo-alerta-error">Estación pendiente de asignación.</div></div>;
  }

  return (
    <div className="modulo-card">
      {mensaje && (
        <div style={{ padding: '10px', borderRadius: '6px', background: '#ecfdf5', color: '#065f46', marginBottom: '12px' }}>
          {mensaje}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
        <RegistrarLlegada
          estacion={info.estacion}
          lineas={info.lineas}
          buses={info.buses}
          bloqueado={Boolean(info.activo)}
          onLlegadaGuardada={() => { setMensaje('Llegada registrada.'); cargar(); }}
        />
        <RegistrarSalida
          recorrido={info.activo}
          onSalidaRegistrada={() => { setMensaje('Salida registrada.'); cargar(); }}
        />
      </div>
    </div>
  );
};