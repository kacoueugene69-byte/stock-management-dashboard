require('dotenv').config();
const bcrypt = require('bcrypt');
const models = require('../models'); // adapte si ton dossier models est ailleurs
const Utilisateur = models.Utilisateur || models.User || models.Utilisateurs || models.utilisateur;

(async () => {
  try {
    if (!Utilisateur) {
      console.error('MODELE_UTILISATEUR_INTRouvABLE');
      process.exit(1);
    }
    const email = 'kacou@gmail.com'; // change l'email si tu veux tester un autre compte
    const u = await Utilisateur.findOne({ where: { email } });
    if (!u) { console.log('Utilisateur non trouvé pour', email); process.exit(0); }
    console.log('Avant:', u.mot_de_passe);
    if (typeof u.mot_de_passe === 'string' && !u.mot_de_passe.startsWith('')) {
      u.mot_de_passe = await bcrypt.hash(u.mot_de_passe, 10);
      await u.save();
      console.log('Après:', u.mot_de_passe);
    } else {
      console.log('Déjà haché ou format inattendu');
    }
    process.exit(0);
  } catch (err) {
    console.error('ERREUR_SCRIPT:', err.message || err);
    process.exit(1);
  }
})();
