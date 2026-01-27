// backend/models/Utilisateur.js - VERSION CORRIGÉE
const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Utilisateur = sequelize.define('Utilisateur', {
  email: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  mot_de_passe: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(30),
    defaultValue: 'vendeur'
  },
  statut: {
    type: DataTypes.STRING(20),
    defaultValue: 'actif'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  derniere_connexion: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'utilisateurs',
  timestamps: false,
  hooks: {
    beforeCreate: async (user) => {
      // Ne rien faire - le hachage est géré manuellement
    },
    beforeUpdate: async (user) => {
      // Ne rien faire - le hachage est géré manuellement
    }
  }
});

module.exports = Utilisateur;