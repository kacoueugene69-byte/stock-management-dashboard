// models/Client.js
const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Client = sequelize.define('Client', {
  code_client: { type: DataTypes.STRING, unique: true, allowNull: false },
  nom: { type: DataTypes.STRING, allowNull: false },
  prenom: DataTypes.STRING,
  telephone: DataTypes.STRING,
  email: DataTypes.STRING,
  adresse: DataTypes.TEXT,
  ville: DataTypes.STRING,
  points_fidelite: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'clients', timestamps: false });

module.exports = Client;
