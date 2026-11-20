# TransMetro Control Central
  sistema web para apoyar la administración y el control de las operaciones del servicio de transporte TransMetro. Permite organizar la información de estaciones, líneas, buses.

El sistema tiene estas funciones tareas,  en un solo lugar y muestra información según el rol de cada usuario.

## Roles del sistema

El sistema cuenta con tres roles. Cada uno tiene acceso a las funciones necesarias.

### 1. Administrador del Sistema (ADMINISTRADOR)
Se encarga de la configuración y administración general. 

- Consultar el panel general con información del sistema.
- Registrar y administrar municipalidades.
- Registrar y administrar el personal.
- Crear y administrar usuarios y asignarles roles.

### 2. Supervisor Operativo (SUPERVISOR)
Se encarga de organizar y supervisar la operación.

- Consultar el panel operativo y revisar las alertas.
- Administrar estaciones, accesos y operadores de estación.
- Administrar guardias.
- Registrar y organizar líneas y rutas.
- Configurar el orden y las distancias entre estaciones.
- Administrar parqueos.
- Administrar buses y sus asignaciones.
- Consultar reportes de la operación.

### 3. Operador de Estación (OPERADOR_ESTACION)
Se encarga de registrar y consultar los movimientos de buses en la estación que tiene asignada. 

- Consultar la información de su estación.
- Registrar la llegada de buses, indicando la línea, la cantidad de pasajeros y otros datos del recorrido.
- Registrar la salida de los buses.
- Consultar el historial de movimientos y las alertas de su estación.


## Funcionalidades principales

- permite gestionar municipalidades, personal y usuarios.
- permite organizar estaciones, accesos, líneas, rutas, guardias y parqueos.
- permite registrar unidades y gestionar sus asignaciones.
- permite guardar las llegadas y salidas de buses en las estaciones.
- permite identificar situaciones como sobrecupo o baja ocupación y dar seguimiento a las alertas.
- permite consultar indicadores generales y datos de la actividad diaria.

Al registrar una llegada, el sistema utiliza la cantidad de pasajeros y la capacidad del bus para evaluar su ocupación. Si la ocupación es igual o superior al 150 %, genera una alerta de sobrecupo. Si es menor al 25 %, muestra una alerta de baja ocupación y establece una espera adicional de cinco minutos antes de habilitar el registro de salida.

## Arquitectura del proyecto

El proyecto está organizado en dos partes principales: frontend y backend.

- Frontend:
contiene las pantallas, formularios, tablas, paneles y menús con los que trabaja cada usuario. También se encarga de comunicarse con el backend.
- Backend:
 recibe las solicitudes del frontend, valida los datos, aplica las reglas del sistema y consulta o actualiza la información en la base de datos.

El backend está organizado en tres capas-

- Capa de presentación: contiene las rutas de la API y recibe las solicitudes.
- Capa lógica: contiene los controladores, servicios y validaciones que gestionan las operaciones del sistema.
- Capa de datos: contiene los modelos que realizan las consultas a PostgreSQL.

Esta organización permite mantener el código ordenado y facilita realizar cambios sin tener que modificar todo el proyecto.

## Tecnologías utilizadas

El sistema está construido con React y CSS para la parte visual, conectado mediante Axios a un servidor en Node.js y Express que guarda toda la información en PostgreSQL, protegiendo los accesos y contraseñas con JWT.

## Requisitos

Antes de iniciar el proyecto, necesita tener instalado:

- Node.js y npm.
- PostgreSQL 17.
- Una base de datos creada para el sistema.
- El script SQL correspondiente para crear las tablas y cargar la información inicial. 


## Consideraciones

- Cada usuario debe iniciar sesión para acceder al sistema.
- Las opciones disponibles dependen del rol asignado a su cuenta.
- El operador de estación necesita tener una estación asignada.
- El backend y PostgreSQL deben estar disponibles para que el frontend pueda consultar y guardar información.

## Autor
Edwin Javier Morales Martinez
4490-21-2946
Examen Privado (Recuperacion) / Análisis y Diseño de Sistemas