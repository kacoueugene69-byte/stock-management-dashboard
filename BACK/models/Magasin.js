// models/Magasin.js
const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Magasin = sequelize.define('Magasin', {
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  adresse: {
    type: DataTypes.STRING,
    allowNull: true
  },
  statut: {
    type: DataTypes.STRING,   // ✅ plus de ENUM
    allowNull: false,
    defaultValue: 'actif'
  }
}, {
  tableName: 'magasins',
  timestamps: false
});

module.exports = Magasin;
