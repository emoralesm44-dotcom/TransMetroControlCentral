// Nombres  para mostrar en la interfaz según el rol del usuario
export const ROLES_ETIQUETAS = {
  ADMINISTRADOR: 'Administrador del Sistema',
  SUPERVISOR: 'Supervisor Operativo',
  OPERADOR_ESTACION: 'Operador de Estación',
};

// Opciones de navegación y módulos disponibles para cada rol
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
    { id: 'operadores-estacion', titulo: 'Operadores de Estación' },
    { id: 'guardias', titulo: 'Guardias' },
    { id: 'lineas', titulo: 'Líneas y rutas' },
    { id: 'orden-distancias', titulo: 'Orden y distancias' },
    { id: 'parqueos', titulo: 'Parqueos' },
    { id: 'buses', titulo: 'Buses y asignaciones' },
    { id: 'reportes', titulo: 'Reportes' },
  ],
  OPERADOR_ESTACION: [
    { id: 'mi-estacion', titulo: 'Mi Estación' },
    { id: 'alertas-estacion', titulo: 'Alertas' },
    { id: 'llegada-salida', titulo: 'Control' },
  ],
};

// Normaliza el texto del rol y verifica si existe dentro de la configuración permitida
export const esRolValido = (rol) => {
  if (!rol) return false;
  return Object.hasOwn(ROLES_MENU, rol.toUpperCase().replace(/\s+/g, '_'));
};