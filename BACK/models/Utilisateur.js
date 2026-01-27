// models/Utilisateur.js - VERSION CORRIGÉE
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
    validate: { 
      isEmail: {
        msg: "Format d'email invalide"
      }
    }
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
      isIn: {
        args: [['superadmin', 'admin', 'gerant', 'vendeur']],
        msg: 'Rôle invalide'
      }
    }
  },
  statut: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'actif',
    validate: {
      isIn: {
        args: [['actif', 'inactif']],
        msg: 'Statut invalide'
      }
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
  // ✅ CRITIQUE : PAS DE HOOKS ICI
  // Le hachage doit se faire dans les routes pour éviter le double hachage
  hooks: {}
});

// ✅ Méthode d'instance pour vérifier le mot de passe
Utilisateur.prototype.verifierMotDePasse = async function(motDePasseClair) {
  try {
    return await bcrypt.compare(motDePasseClair, this.mot_de_passe);
  } catch (err) {
    console.error('Erreur vérification mot de passe:', err);
    return false;
  }
};

// ✅ Méthode statique pour créer un utilisateur avec mot de passe haché
Utilisateur.creerAvecMotDePasse = async function(userData) {
  const { email, mot_de_passe, role, statut } = userData;
  
  // Validation
  if (!email || !mot_de_passe) {
    throw new Error('Email et mot de passe obligatoires');
  }
  
  if (mot_de_passe.length < 6) {
    throw new Error('Le mot de passe doit contenir au moins 6 caractères');
  }
  
  // Hachage
  const hash = await bcrypt.hash(mot_de_passe, 12);
  
  // Création
  return await Utilisateur.create({
    email: email.trim().toLowerCase(),
    mot_de_passe: hash,
    role: role || 'vendeur',
    statut: statut || 'actif'
  }, {
    hooks: false
  });
};

module.exports = Utilisateur;