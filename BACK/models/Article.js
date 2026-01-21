// models/Article.js
const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Article = sequelize.define('Article', {
  code_article: { type: DataTypes.STRING, unique: true, allowNull: false },
  nom_article: { type: DataTypes.STRING, allowNull: false },
  prix_achat: { type: DataTypes.DECIMAL, defaultValue: 0 },
  prix_vente: { type: DataTypes.DECIMAL, allowNull: false },
  quantite_stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  statut: { type: DataTypes.STRING, defaultValue: 'actif' },
  seuil_alerte: { type: DataTypes.INTEGER, defaultValue: 5 },
  description: DataTypes.TEXT
}, { tableName: 'articles', timestamps: false });

module.exports = Article;
