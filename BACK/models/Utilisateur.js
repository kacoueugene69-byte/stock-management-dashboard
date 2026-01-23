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
    allowNull: false
  },
  mot_de_passe: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'vendeur'
  },
  statut: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'actif'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'utilisateurs',
  timestamps: false,
  hooks: {
    beforeCreate: async (utilisateur) => {
      if (utilisateur.mot_de_passe) {
        const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
        utilisateur.mot_de_passe = await bcrypt.hash(utilisateur.mot_de_passe, rounds);
      }
    },
    beforeUpdate: async (utilisateur) => {
      if (utilisateur.changed && utilisateur.changed('mot_de_passe')) {
        const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
        utilisateur.mot_de_passe = await bcrypt.hash(utilisateur.mot_de_passe, rounds);
      }
    }
  }
});

Utilisateur.prototype.verifierMotDePasse = async function(motDePasseClair) {
  return await bcrypt.compare(motDePasseClair, this.mot_de_passe);
};

module.exports = Utilisateur;
