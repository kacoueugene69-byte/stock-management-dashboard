const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { Utilisateur } = require('../models');

// GET tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const users = await Utilisateur.findAll({
      attributes: { exclude: ['mot_de_passe'] } // Ne pas renvoyer les mots de passe
    });
    return res.json(users);
  } catch (err) {
    console.error('❌ Erreur GET users:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST créer un utilisateur
router.post('/', async (req, res) => {
  try {
    const { email, mot_de_passe, role, statut } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: "Email et mot de passe obligatoires." });
    }

    if (mot_de_passe.length < 8) {
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères." });
    }

    const emailClean = email.trim().toLowerCase();

    const existing = await Utilisateur.findOne({ where: { email: emailClean } });
    if (existing) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }

    // Hacher le mot de passe
    const rounds = Number.parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
    const saltRounds = (rounds >= 10 && rounds <= 14) ? rounds : 12;
    const hashed = await bcrypt.hash(mot_de_passe.trim(), saltRounds);

    const user = await Utilisateur.create({
      email: emailClean,
      mot_de_passe: hashed,
      role: role || 'vendeur',
      statut: statut || 'actif'
    }, {
      hooks: false // Désactiver les hooks pour éviter le double hachage
    });

    // Ne pas renvoyer le mot de passe
    const userResponse = user.toJSON();
    delete userResponse.mot_de_passe;

    return res.status(201).json(userResponse);
  } catch (err) {
    console.error('❌ Erreur POST user:', err);
    return res.status(500).json({ error: err.message });
  }
});

// PUT modifier un utilisateur
router.put('/:id', async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const updates = { ...req.body };
    
    // Normaliser l'email
    if (updates.email) {
      updates.email = updates.email.trim().toLowerCase();
    }

    // Si le mot de passe est modifié, le hacher
    if (updates.mot_de_passe) {
      if (updates.mot_de_passe.length < 8) {
        return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères." });
      }
      const rounds = Number.parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
      const saltRounds = (rounds >= 10 && rounds <= 14) ? rounds : 12;
      updates.mot_de_passe = await bcrypt.hash(updates.mot_de_passe.trim(), saltRounds);
    }

    await user.update(updates, { hooks: false });

    // Ne pas renvoyer le mot de passe
    const userResponse = user.toJSON();
    delete userResponse.mot_de_passe;

    return res.json(userResponse);
  } catch (err) {
    console.error('❌ Erreur PUT user:', err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE supprimer un utilisateur
router.delete('/:id', async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    await user.destroy();
    return res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    console.error('❌ Erreur DELETE user:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;