// models/Personnel.js
const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Personnel = sequelize.define('Personnel', {
  matricule: { type: DataTypes.STRING, unique: true, allowNull: false },
  nom: { type: DataTypes.STRING, allowNull: false },
  prenom: { type: DataTypes.STRING, allowNull: false },
  poste: DataTypes.STRING,
  telephone: DataTypes.STRING,
  email: DataTypes.STRING,
  statut: { type: DataTypes.STRING, defaultValue: 'actif' },
  salaire_base: DataTypes.DECIMAL,
  photo_url: DataTypes.TEXT,
  date_embauche: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'personnels', timestamps: false });

module.exports = Personnel;
