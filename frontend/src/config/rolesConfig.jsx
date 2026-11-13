export const ROLES_ETIQUETAS = {
  ADMINISTRADOR: 'Administrador del Sistema',
  SUPERVISOR: 'Supervisor Operativo',
  PILOTO: 'Piloto de Unidad',
  OPERADOR_ESTACION: 'Operador de Estación',
};

export const ROLES_MENU = {
  ADMINISTRADOR: [
    { id: 'inicio', titulo: 'Panel General' },
    { id: 'municipalidades', titulo: 'Municipalidades' },
    { id: 'personal', titulo: 'Registro de personal' },
    { id: 'usuarios', titulo: 'Usuarios y roles' },
  ],
  SUPERVISOR: [
    { id: 'inicio', titulo: 'Panel Operativo' },
    { id: 'estaciones', titulo: 'Estaciones y accesos' },
    { id: 'lineas', titulo: 'Líneas y rutas' },
    { id: 'distancias', titulo: 'Orden y distancias' },
    { id: 'guardias', titulo: 'Guardias' },
    { id: 'parqueos', titulo: 'Parqueos' },
    { id: 'buses', titulo: 'Buses y asignaciones' },
    { id: 'reportes', titulo: 'Reportes' },
  ],
  PILOTO: [
    { id: 'inicio', titulo: 'Mi Jornada' },
    { id: 'mi-bus', titulo: 'Consultar bus asignado' },
    { id: 'mi-ruta', titulo: 'Consultar línea y recorrido' },
    { id: 'mi-parqueo', titulo: 'Consultar parqueo' },
  ],
  OPERADOR_ESTACION: [
    { id: 'inicio', titulo: 'Mi Estación' },
    { id: 'llegadas', titulo: 'Registrar llegada' },
    { id: 'salidas', titulo: 'Registrar salida' },
    { id: 'alertas-estacion', titulo: 'Alertas de estación' },
  ],
};

export const esRolValido = (rol) => {
  if (!rol) return false;
  return Object.hasOwn(ROLES_MENU, rol.toUpperCase().replace(/\s+/g, '_'));
};