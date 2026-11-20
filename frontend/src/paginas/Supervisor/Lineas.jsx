import React, { useEffect, useState } from 'react';
import CRUD from '../../componentes/CRUD';
import { lineaServicio } from '../../servicios/lineaServicio';
import { municipalidadServicio } from '../../servicios/municipalidadServicios';

export const Lineas = () => {
  const [municipalidades, setMunicipalidades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarMunicipalidades = async () => {
      try {
        const respuesta = await municipalidadServicio.listar();

        setMunicipalidades(
          (respuesta.municipalidades || []).filter((m) => m.activo)
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarMunicipalidades();
  }, []);

  if (cargando) {
    return <p>Cargando municipalidades...</p>;
  }

  if (error) {
    return <div className="modulo-alerta-error">{error}</div>;
  }

  return (
    <CRUD
      titulo="Líneas / Rutas"
      servicio={lineaServicio}
      identificador="id_linea"
      propiedadLista="lineas"
      textoBoton="Nueva Línea"
      placeholder="Buscar por código, línea o municipalidad..."
      mensajeVacio="No hay líneas registradas."
      columnas={[
        { campo: 'codigo_linea', titulo: 'Código' },
        { campo: 'nombre_linea', titulo: 'Nombre de Línea' },
        { campo: 'descripcion', titulo: 'Descripción' },
        { campo: 'nombre_municipalidad', titulo: 'Municipalidad' },
        { campo: 'total_estaciones', titulo: 'Estaciones' },
        { campo: 'activo', titulo: 'Estado', tipo: 'estado' },
      ]}
      campos={[
        {
          nombre: 'codigo_linea',
          etiqueta: 'Código de Línea',
          tipo: 'text',
          requerido: true,
          placeholder: 'Ej. L-12',
        },
        {
          nombre: 'nombre_linea',
          etiqueta: 'Nombre de la Línea',
          tipo: 'text',
          requerido: true,
          placeholder: 'Ej. Centra Sur - Plaza Barrios',
        },
        {
          nombre: 'id_municipalidad',
          etiqueta: 'Municipalidad',
          tipo: 'select',
          requerido: true,
          opciones: [
            { valor: '', etiqueta: '-- Seleccione una municipalidad --' },
            ...municipalidades.map((m) => ({
              valor: m.id_municipalidad,
              etiqueta: `${m.nombre} (${m.departamento})`,
            })),
          ],
        },
        {
          nombre: 'descripcion',
          etiqueta: 'Descripción de la Ruta',
          tipo: 'textarea',
          filas: 3,
          placeholder: 'Detalle del recorrido u observaciones...',
        },
      ]}
      inicial={{
        codigo_linea: '',
        nombre_linea: '',
        descripcion: '',
        id_municipalidad: municipalidades[0]?.id_municipalidad || '',
        activo: true,
      }}
    />
  );
};
