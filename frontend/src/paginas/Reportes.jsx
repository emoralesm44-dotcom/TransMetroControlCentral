import React, { useEffect, useState } from 'react';
import { reporteServicio } from '../servicios/reporteServicio';
import { MdTrain, MdAltRoute, MdLocalParking } from 'react-icons/md';
import './Reportes.css';

const REPORTES = [
  {
    id: 'estaciones',
    titulo: 'Estaciones',
    descripcion: 'Estaciones, municipalidades, líneas, accesos y parqueos.',
    icono: <MdTrain />,
    columnas: [
      { key: 'nombre_estacion', label: 'Estación' },
      { key: 'municipalidad', label: 'Municipalidad' },
      { key: 'lineas_asignadas', label: 'Líneas asignadas' },
      { key: 'accesos', label: 'Accesos y Guardias' },
      { key: 'parqueo', label: 'Parqueo' },
    ],
  },
  {
    id: 'lineas',
    titulo: 'Líneas y Buses',
    descripcion: 'Municipalidad, estaciones, recorrido y buses asignados.',
    icono: <MdAltRoute />,
    columnas: [
      { key: 'nombre_linea', label: 'Línea' },
      { key: 'municipalidad', label: 'Municipalidad' },
      { key: 'cantidad_estaciones', label: 'Estaciones / Paradas' },
      { key: 'distancia_total_km', label: 'Recorrido total (km)' },
      { key: 'buses_asignados', label: 'Cantidad de buses' },
      { key: 'placas', label: 'Placas de buses' },
    ],
  },
  {
    id: 'parqueos',
    titulo: 'Parqueos',
    descripcion: 'Capacidad, espacios disponibles y buses asignados.',
    icono: <MdLocalParking />,
    columnas: [
      { key: 'nombre_parqueo', label: 'Parqueo' },
      { key: 'estacion_asociada', label: 'Estación' },
      { key: 'capacidad_unidades', label: 'Capacidad' },
      { key: 'espacios_libres', label: 'Disponibles / Libres' },
      { key: 'buses_asignados', label: 'Cantidad de buses' },
      { key: 'listado_unidades', label: 'Unidades asignadas' },
    ],
  },
];

export const Reportes = () => {
  const [tipo, setTipo] = useState('estaciones');
  const [filas, setFilas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const reporte = REPORTES.find((r) => r.id === tipo);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError('');
    setFiltro('');

    reporteServicio.obtener(tipo)
      .then((res) => { if (activo) setFilas(res.datos || []); })
      .catch((err) => { if (activo) { setError(err.message || 'No se pudo cargar el reporte.'); setFilas([]); } })
      .finally(() => { if (activo) setCargando(false); });

    return () => { activo = false; };
  }, [tipo]);

  const filasFiltradas = filas.filter((fila) =>
    Object.values(fila).some((val) => String(val ?? '').toLowerCase().includes(filtro.toLowerCase()))
  );

  const formatear = (key, val) => {
    if (val === null || val === undefined || val === '') return '-';
    if (key === 'distancia_total_km') return `${Number(val).toFixed(2)} km`;
    return Array.isArray(val) ? val.join(', ') : val;
  };

  return (
    <div className="reportes">
      <div className="reportes-encabezado">
        <div>
          <h2>Centro de Reportes</h2>
          <p>Consulta y genera reportes de TransMetro.</p>
        </div>
        <button className="reportes-btn-pdf" onClick={() => window.print()} disabled={!filasFiltradas.length || cargando}>
          Exportar PDF
        </button>
      </div>

      <div className="reportes-catalogo">
        {REPORTES.map((item) => (
          <button key={item.id} className={`reportes-tarjeta ${tipo === item.id ? 'activa' : ''}`} onClick={() => setTipo(item.id)}>
            <span className="reportes-icono">{item.icono}</span>
            <span className="reportes-titulo">{item.titulo}</span>
            <span className="reportes-descripcion">{item.descripcion}</span>
          </button>
        ))}
      </div>

      <section className="reportes-contenido" id="reportes-pdf">
        <div className="reportes-titulo-pdf">
          <h2>TransMetro - {reporte.titulo}</h2>
          <p>{reporte.descripcion}</p>
        </div>

        <div className="reportes-herramientas">
          <div>
            <h3>Reporte de {reporte.titulo}</h3>
            <span>{filasFiltradas.length} registros encontrados</span>
          </div>
          <input type="text" placeholder="Buscar en el reporte..." value={filtro} onChange={(e) => setFiltro(e.target.value)} />
        </div>

        {error && <div className="reportes-error">{error}</div>}

        {cargando ? (
          <div className="reportes-vacio">Cargando información...</div>
        ) : (
          <div className="reportes-tabla-contenedor">
            <table className="reportes-tabla">
              <thead>
                <tr>
                  {reporte.columnas.map((col) => <th key={col.key}>{col.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {filasFiltradas.length ? (
                  filasFiltradas.map((fila, i) => (
                    <tr key={i}>
                      {reporte.columnas.map((col) => <td key={col.key}>{formatear(col.key, fila[col.key])}</td>)}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={reporte.columnas.length} className="reportes-vacio">No hay registros para mostrar.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};