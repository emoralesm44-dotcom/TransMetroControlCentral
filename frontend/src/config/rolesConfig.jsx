export const ROLES_MENU = {
  ADMINISTRADOR: [
    { id: 'usuarios', titulo: 'Usuarios y roles' },
    { id: 'personal', titulo: 'Registro de personal' },
    { id: 'municipalidades', titulo: 'Municipalidades' },
  ],
  SUPERVISOR: [
    { id: 'lineas', titulo: 'Líneas y rutas' },
    { id: 'estaciones', titulo: 'Estaciones y accesos' },
    { id: 'guardias', titulo: 'Guardias' },
    { id: 'buses', titulo: 'Buses y asignaciones' },
    { id: 'parqueos', titulo: 'Parqueos' },
    { id: 'distancias', titulo: 'Distancias' },
    { id: 'reportes', titulo: 'Reportes' },
  ],
  PILOTO: [
    { id: 'mi-bus', titulo: 'Consultar bus asignado' },
    { id: 'mi-ruta', titulo: 'Consultar línea y recorrido' },
    { id: 'mi-parqueo', titulo: 'Consultar parqueo' },
    { id: 'alertas-piloto', titulo: 'Alertas y solicitudes de apoyo' },
  ],
  OPERADOR_ESTACION: [
    { id: 'control-estacion', titulo: 'Control de mi estación' },
    { id: 'pasajeros', titulo: 'Registro de pasajeros' },
    { id: 'horarios', titulo: 'Llegadas y salidas' },
    { id: 'visitas-buses', titulo: 'Visitas de buses' },
    { id: 'alertas-estacion', titulo: 'Visualización de alertas' },
  ],
};

export const esRolValido = (rol) => {
  if (!rol) return false;
  return Object.hasOwn(ROLES_MENU, rol.toUpperCase().replace(/\s+/g, '_'));
};