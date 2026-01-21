const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Utilisateur = sequelize.define('Utilisateur', {
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  mot_de_passe: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  // ✅ C'est ici que tu mets le champ "role"
  role: {
    type: DataTypes.ENUM('superadmin', 'admin', 'gerant', 'vendeur'),
    allowNull: false,
    defaultValue: 'vendeur'
  },

  statut: {
    type: DataTypes.STRING,
    defaultValue: 'actif'
  },

  derniere_connexion: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'utilisateurs',
  timestamps: false
});

module.exports = Utilisateur;
