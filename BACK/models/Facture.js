// models/Facture.js
const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Facture = sequelize.define('Facture', {
  numero_facture: { type: DataTypes.STRING, unique: true, allowNull: false },
  references_vente: { type: DataTypes.TEXT, allowNull: false },
  statut_facture: { type: DataTypes.ENUM('livree_non_payee', 'payee_non_livree', 'payee_livree'), allowNull: false }
}, { tableName: 'factures', timestamps: false });

module.exports = Facture;
