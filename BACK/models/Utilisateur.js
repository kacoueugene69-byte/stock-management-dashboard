// models/Utilisateur.js
const { DataTypes } = require('sequelize');
const sequelize = require('./database'); // ton instance Sequelize

const Utilisateur = sequelize.define('Utilisateur', {
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  mot_de_passe: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('superadmin', 'admin', 'gerant', 'vendeur'),
    allowNull: false,
    defaultValue: 'vendeur'
  },
  statut: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'actif'
  },
  derniere_connexion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'utilisateurs',
  timestamps: false
});

module.exports = Utilisateur;
