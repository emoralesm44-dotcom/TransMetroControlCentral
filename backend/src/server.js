const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./capaPresentacion/rutas/authRoutes');
const { aplicarHelmet } = require('./capaLogica/middlewares/seguridadMiddleware');
const municipalidadRoutes = require('./capaPresentacion/rutas/municipalidadRutas');
const empleadoRutas = require('./capaPresentacion/rutas/empleadoRutas');

const app = express();

app.disable('x-powered-by');
app.use(aplicarHelmet);
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/municipalidades', municipalidadRoutes);
app.use('/api/empleados', empleadoRutas);




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor API seguro de Transmetro activo en puerto ${PORT}`);
});