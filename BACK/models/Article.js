// models/Article.js
const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Article = sequelize.define('Article', {
  identifiant: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'identifiant'
  },
  article_code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    field: 'article_code'
  },
  nom_article: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'nom_article'
  },
  prix_achat: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    defaultValue: 0,
    field: 'prix_achat'
  },
  prix_vente: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    field: 'prix_vente'
  },
  quantite_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'quantite_stock'
  },
  seuil_alerte: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    field: 'seuil_alerte'
  },
  id_categorie: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_categorie'
  },
  statut: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'actif',
    field: 'statut'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description'
  }
}, {
  tableName: 'articles',
  timestamps: false
});

module.exports = Article;
