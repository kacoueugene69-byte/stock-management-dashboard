// models/Utilisateur.js
const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Utilisateur = sequelize.define('Utilisateur', {
  nom_utilisateur: { type: DataTypes.STRING, unique: true, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  mot_de_passe: { type: DataTypes.TEXT, allowNull: false },
  role: { type: DataTypes.ENUM('superadmin', 'admin', 'gerant', 'vendeur'), allowNull: false },
  statut: { type: DataTypes.STRING, defaultValue: 'actif' },
  derniere_connexion: DataTypes.DATE
}, { tableName: 'utilisateurs', timestamps: false });

module.exports = Utilisateur;
