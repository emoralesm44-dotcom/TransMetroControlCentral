// Importación de Pool de PostgreSQL conexiones reutilizables y carga de variables de entorno
const { Pool } = require('pg');
require('dotenv').config();

// Configuración del pool de conexiones a la base de datos
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 5432,
});

module.exports = pool;