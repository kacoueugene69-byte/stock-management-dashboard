// models/MouvementStock.js
const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const MouvementStock = sequelize.define('MouvementStock', {
  type_mouvement: { type: DataTypes.ENUM('entrée', 'sortie'), allowNull: false },
  quantite: { type: DataTypes.INTEGER, allowNull: false },
  raison: DataTypes.TEXT
}, { tableName: 'mouvements_stock', timestamps: false });

module.exports = MouvementStock;
