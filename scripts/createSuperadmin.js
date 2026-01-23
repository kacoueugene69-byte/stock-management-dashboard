require('dotenv').config();
const bcrypt = require('bcrypt');
const { Utilisateur } = require('../BACK/models');

(async () => {
  try {
    const email = 'kouacou@cdcom.com';
    const password = 'Kouassi@2000';
    const existing = await Utilisateur.findOne({ where: { email } });
    if (existing) {
      console.log('Utilisateur existe déjà');
      process.exit(0);
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await Utilisateur.create({
      email,
      mot_de_passe: hashed,
      role: 'superadmin',
      statut: 'actif'
    });
    console.log('Superadmin créé', user.email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
