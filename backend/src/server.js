// Importación de dependencias principales y configuración de variables de entorno
// Y middlewares de seguridad y  de rutas 
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();


const authRoutes = require('./capaPresentacion/rutas/authRoutes');
const { aplicarHelmet } = require('./capaLogica/middlewares/seguridadMiddleware');
const municipalidadRoutes = require('./capaPresentacion/rutas/municipalidadRutas');
const empleadoRutas = require('./capaPresentacion/rutas/empleadoRutas');
const usuarioRutas = require('./capaPresentacion/rutas/usuariosRutas');
const lineaRutas = require('./capaPresentacion/rutas/lineasRutas');
const estacionRutas = require('./capaPresentacion/rutas/estacionRutas');
const guardiaRutas = require('./capaPresentacion/rutas/guardiaRutas');
const parqueoRutas = require('./capaPresentacion/rutas/parqueoRutas');
const busRutas = require('./capaPresentacion/rutas/busesRutas');
const lineaEstacionRutas = require('./capaPresentacion/rutas/lineaEstacionRutas');
const operadorEstacionRutas = require('./capaPresentacion/rutas/operadorEstacionRutas');
const reporteRutas = require('./capaPresentacion/rutas/reporteRutas');
const terminalOperadorRutas = require('./capaPresentacion/rutas/terminalOperadorRutas');
const dashboardRutas = require('./capaPresentacion/rutas/dashboardRutas');

const app = express();

// Configuración de seguridad, cookies y límite de tamaño en peticiones 
app.disable('x-powered-by');
app.use(aplicarHelmet);
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));

// Configuración de CORS para permitir peticiones del frontend con credenciales
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Definición de endpoints principales de la API
app.use('/api/auth', authRoutes);
app.use('/api/municipalidades', municipalidadRoutes);
app.use('/api/empleados', empleadoRutas);
app.use('/api/usuarios', usuarioRutas);
app.use('/api/lineas', lineaRutas);
app.use('/api/estaciones', estacionRutas);
app.use('/api/guardias', guardiaRutas);
app.use('/api/parqueos', parqueoRutas);
app.use('/api/buses', busRutas);
app.use('/api/linea-estaciones', lineaEstacionRutas);
app.use('/api/operador-estacion', operadorEstacionRutas);
app.use('/api/reportes', reporteRutas);
app.use('/api/terminal-operador', terminalOperadorRutas);
app.use('/api/dashboard', dashboardRutas);

// Inicialización del servidor en el puerto 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor API seguro de Transmetro activo en puerto ${PORT}`);
});