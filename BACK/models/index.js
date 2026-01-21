// models/index.js
const sequelize = require('./database');

const Magasin = require('./Magasin');
const Personnel = require('./Personnel');
const Utilisateur = require('./Utilisateur');
const Categorie = require('./Categorie');
const Article = require('./Article');
const Client = require('./Client');
const Vente = require('./Vente');
const VenteArticle = require('./VenteArticle');
const Commande = require('./Commande');
const Facture = require('./Facture');
const MouvementStock = require('./MouvementStock');

// Associations
Magasin.hasMany(Personnel, { foreignKey: 'id_magasin' });
Personnel.belongsTo(Magasin);

Categorie.hasMany(Article, { foreignKey: 'id_categorie' });
Article.belongsTo(Categorie);

Client.hasMany(Vente, { foreignKey: 'id_client' });
Vente.belongsTo(Client);

Vente.hasMany(VenteArticle, { foreignKey: 'id_vente' });
VenteArticle.belongsTo(Vente);

Article.hasMany(VenteArticle, { foreignKey: 'id_article' });
VenteArticle.belongsTo(Article);

Vente.hasOne(Facture, { foreignKey: 'id_vente' });
Facture.belongsTo(Vente);

Magasin.hasMany(MouvementStock, { foreignKey: 'id_magasin' });
MouvementStock.belongsTo(Magasin);

Article.hasMany(MouvementStock, { foreignKey: 'id_article' });
MouvementStock.belongsTo(Article);

module.exports = {
  sequelize,
  Magasin,
  Personnel,
  Utilisateur,
  Categorie,
  Article,
  Client,
  Vente,
  VenteArticle,
  Commande,
  Facture,
  MouvementStock
};
