const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'gstock_db',
  password: process.env.DB_PASSWORD || 'admin',  // ⚠️ Important : doit être une string
  port: Number(process.env.DB_PORT) || 5432,
});

// Test de connexion
pool.on('error', (err) => {
  console.error('❌ Erreur de connexion à la BD:', err);
});

pool.on('connect', () => {
  console.log('✅ Connexion à PostgreSQL établie');
});

module.exports = { pool };