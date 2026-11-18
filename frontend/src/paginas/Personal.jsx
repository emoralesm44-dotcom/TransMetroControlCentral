
import React from 'react';
import CRUD from '../componentes/CRUD';
import { empleadoServicio } from '../servicios/empleadoServicios';

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
  return (
    <CRUD
      titulo="Personal"
      servicio={empleadoServicio}
      identificador="id_empleado"
      propiedadLista="empleados"
      textoBoton="Registrar Personal"
      placeholder="Buscar por nombre o DPI..."
      mensajeVacio="No hay registros de personal."
      anchoModal="580px"
      columnasFormulario={2}

      buscar={(emp, texto) =>
        `${emp.nombre} ${emp.apellido}`
          .toLowerCase()
          .includes(texto.toLowerCase()) ||
        String(emp.dpi || '').includes(texto)
      }

      filtros={[
        {
          nombre: 'tipo_personal',
          campo: 'tipo_personal',
          etiquetaTodos: 'Todos los puestos',
          opciones: TIPOS_PERSONAL,
        },
      ]}

      columnas={[
        {
          campo: 'nombre',
          titulo: 'Nombre Completo',
          render: (emp) => `${emp.nombre} ${emp.apellido}`,
        },
        {
          campo: 'dpi',
          titulo: 'DPI',
        },
        {
          campo: 'telefono',
          titulo: 'Teléfono',
        },
        {
          campo: 'historial_educativo',
          titulo: 'Historial Educativo',
        },
        {
          campo: 'tipo_personal',
          titulo: 'Puesto',
        },
        {
          campo: 'fecha_contratacion',
          titulo: 'Contratación',
        },
        {
          campo: 'activo',
          titulo: 'Estado',
          tipo: 'estado',
        },
      ]}

      campos={[
        {
          nombre: 'nombre',
          etiqueta: 'Nombre',
          tipo: 'text',
          requerido: true,
        },
        {
          nombre: 'apellido',
          etiqueta: 'Apellido',
          tipo: 'text',
          requerido: true,
        },
        {
          nombre: 'dpi',
          etiqueta: 'DPI (13 dígitos)',
          tipo: 'text',
          requerido: true,
          maxLength: 13,
          placeholder: 'Ej. 3890219112101',
        },
        {
          nombre: 'telefono',
          etiqueta: 'Teléfono',
          tipo: 'text',
          placeholder: 'Ej. 4532-1454',
        },
        {
          nombre: 'tipo_personal',
          etiqueta: 'Tipo de Personal',
          tipo: 'select',
          requerido: true,
          opciones: TIPOS_PERSONAL,
        },
        {
          nombre: 'fecha_contratacion',
          etiqueta: 'Fecha de Contratación',
          tipo: 'date',
        },
        {
          nombre: 'direccion_residencia',
          etiqueta: 'Dirección de Residencia',
          tipo: 'text',
          anchoCompleto: true,
        },
        {
          nombre: 'historial_educativo',
          etiqueta: 'Historial Educativo',
          tipo: 'textarea',
          filas: 3,
          anchoCompleto: true,
          placeholder: 'Estudios realizados, licencias o certificaciones...',
        },
      ]}

      inicial={FORM_INICIAL}
    />
  );
};
