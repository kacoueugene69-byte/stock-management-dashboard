// models/VenteArticle.js
const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const VenteArticle = sequelize.define('VenteArticle', {
  quantite: { type: DataTypes.INTEGER, allowNull: false },
  prix_unitaire: { type: DataTypes.DECIMAL, allowNull: false }
}, { tableName: 'vente_articles', timestamps: false });

module.exports = VenteArticle;
