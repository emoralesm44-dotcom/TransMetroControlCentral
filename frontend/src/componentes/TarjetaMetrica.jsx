import React from 'react';

export const TarjetaMetrica = ({ titulo, valor, subtitulo, color = '#047857' }) => (
  <div style={{
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderLeft: `4px solid ${color}`,
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
  }}>
    <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>{titulo}</span>
    <span style={{ fontSize: '26px', fontWeight: 700, color: '#111827' }}>{valor}</span>
    {subtitulo && <span style={{ fontSize: '12px', color: '#4b5563' }}>{subtitulo}</span>}
  </div>
);