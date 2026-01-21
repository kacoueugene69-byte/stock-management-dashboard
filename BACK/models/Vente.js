// models/Vente.js
const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Vente = sequelize.define('Vente', {
  montant_total: { type: DataTypes.DECIMAL, allowNull: false },
  montant_paye: { type: DataTypes.DECIMAL, defaultValue: 0 },
  mode_paiement: { type: DataTypes.STRING, defaultValue: 'espèces' },
  statut_paiement: { type: DataTypes.ENUM('payé', 'partiel', 'impayé') },
  nom_vendeur: DataTypes.STRING
}, { tableName: 'ventes', timestamps: false });

module.exports = Vente;
