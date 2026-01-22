// models/VenteArticle.js
const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const VenteArticle = sequelize.define('VenteArticle', {
  id_vente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_article: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  prix_unitaire: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  // ⚠️ On ne définit pas total_ligne ici, car c’est une colonne générée côté SQL
}, {
  tableName: 'vente_articles',
  timestamps: false
});

module.exports = VenteArticle;
