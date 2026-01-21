// models/Commande.js
const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Commande = sequelize.define('Commande', {
  numero_commande: { type: DataTypes.STRING, unique: true, allowNull: false },
  type_commande: { type: DataTypes.ENUM('materiels_elevage', 'poussins', 'produits_veterinaires', 'aliment_faci', 'aliment_local'), allowNull: false },
  details_commande: { type: DataTypes.TEXT, allowNull: false },
  nom_client: { type: DataTypes.STRING, allowNull: false },
  statut: { type: DataTypes.ENUM('en attente', 'preparation', 'livree', 'annulee'), defaultValue: 'en attente' },
  montant_total: { type: DataTypes.DECIMAL, allowNull: false },
  montant_paye: { type: DataTypes.DECIMAL, defaultValue: 0 },
  statut_paiement: { type: DataTypes.STRING, defaultValue: 'impayé' }
}, { tableName: 'commandes', timestamps: false });

module.exports = Commande;
