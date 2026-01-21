// models/Categorie.js
const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Categorie = sequelize.define('Categorie', {
  nom_categorie: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT
}, { tableName: 'categories', timestamps: false });

module.exports = Categorie;
