// models/Utilisateur.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('./database');

const Utilisateur = sequelize.define('Utilisateur', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    validate: { isEmail: true }
  },
  mot_de_passe: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'vendeur',
    validate: {
      isIn: [['superadmin', 'admin', 'gerant', 'vendeur']]
    }
  },
  statut: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'actif',
    validate: {
      isIn: [['actif', 'inactif']]
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  derniere_connexion: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'utilisateurs',
  timestamps: false,
  hooks: {}  // ⚠️ PAS DE HOOKS - hachage dans routes/auth.js
});

// Méthode pour vérifier le mot de passe
Utilisateur.prototype.verifierMotDePasse = async function(motDePasseClair) {
  return await bcrypt.compare(motDePasseClair, this.mot_de_passe);
};

module.exports = Utilisateur;