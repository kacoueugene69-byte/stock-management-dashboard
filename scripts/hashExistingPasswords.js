// scripts/hashExistingPasswords.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const { Utilisateur } = require('../BACK/models'); // adapte le chemin
const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

(async () => {
  try {
    const users = await Utilisateur.findAll();
    for (const u of users) {
      const plain = u.mot_de_passe;
      // si déjà haché (bcrypt hash commence par $2), on skip
      if (typeof plain === 'string' && !plain.startsWith('$2')) {
        const hashed = await bcrypt.hash(plain, SALT_ROUNDS);
        u.mot_de_passe = hashed;
        await u.save();
        console.log(`Hashed: ${u.email}`);
      } else {
        console.log(`Skip (déjà haché ?) : ${u.email}`);
      }
    }
    console.log('Terminé');
    process.exit(0);
  } catch (err) {
    console.error('Erreur hashExistingPasswords', err);
    process.exit(1);
  }
})();
