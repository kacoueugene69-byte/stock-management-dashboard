// models/database.js

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false // ou true si tu fournis le CA
    }
  }
});

module.exports = sequelize;

