const { DataTypes } = require('sequelize');
const sequelize = require('./database'); // on importe l’instance

const Magasin = sequelize.define('Magasin', {
  nom_magasin: { type: DataTypes.STRING, allowNull: false },
  adresse: DataTypes.TEXT,
  ville: DataTypes.STRING,
  telephone: DataTypes.STRING,
  email: DataTypes.STRING,
  directeur: DataTypes.STRING,
  statut: { type: DataTypes.ENUM('actif', 'inactif'), defaultValue: 'actif' }
}, { tableName: 'magasins', timestamps: false });

module.exports = Magasin;
