
import CRUD from '../../componentes/CRUD';
import { municipalidadServicio } from '../../servicios/municipalidadServicios';

export const Municipalidades = () => {
  return (
    <CRUD
      titulo="Municipalidades"
      servicio={municipalidadServicio}
      identificador="id_municipalidad"
      propiedadLista="municipalidades"

      textoBoton="Nueva Municipalidad"
      placeholder="Buscar municipalidad o departamento..."

      columnas={[
        {
          campo: 'nombre',
          titulo: 'Nombre de Municipalidad'
        },
        {
          campo: 'departamento',
          titulo: 'Departamento'
        },
        {
          campo: 'activo',
          titulo: 'Estado',
          tipo: 'estado'
        }
      ]}

      campos={[
        {
          nombre: 'nombre',
          etiqueta: 'Nombre',
          tipo: 'text',
          requerido: true,
          placeholder: 'Ej. Municipalidad de Guatemala'
        },
        {
          nombre: 'departamento',
          etiqueta: 'Departamento',
          tipo: 'text',
          requerido: true,
          placeholder: 'Ej. Guatemala'
        },
        {
          nombre: 'activo',
          etiqueta: 'Estado',
          tipo: 'boolean'
        }
      ]}

      inicial={{
        nombre: '',
        departamento: 'Guatemala',
        activo: true
      }}
    />
  );
};
