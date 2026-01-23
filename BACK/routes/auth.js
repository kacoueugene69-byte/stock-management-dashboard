const express = require('express');
const bcrypt = require('bcrypt');
const { Utilisateur } = require('../models');

const router = express.Router();

// ✅ Route d'inscription
router.post('/register', async (req, res) => {
  try {
    const { email, mot_de_passe, role, statut } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: "Email et mot de passe obligatoires." });
    }

    const existing = await Utilisateur.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existing) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const hashed = await bcrypt.hash(mot_de_passe.trim(), rounds);

    const user = await Utilisateur.create({
      email: email.trim().toLowerCase(),
      mot_de_passe: hashed,
      role: role || 'vendeur',
      statut: statut || 'actif'
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        statut: user.statut,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Erreur inscription:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
  }
});

// ✅ Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: "Email et mot de passe obligatoires." });
    }

    const user = await Utilisateur.findOne({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    if (user.statut !== 'actif') {
      return res.status(403).json({ error: "Compte désactivé. Contactez l'administrateur." });
    }

    const motDePasseValide = await bcrypt.compare(mot_de_passe.trim(), user.mot_de_passe);
    if (!motDePasseValide) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    res.json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        statut: user.statut,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Erreur login:', err);
    res.status(500).json({ error: "Erreur serveur: " + err.message });
  }
});

module.exports = router;
