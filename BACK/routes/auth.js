// routes/auth.js
const express = require('express');
const router = express.Router();
const { Utilisateur } = require('../models'); // assure-toi que models/index.js exporte Utilisateur

// Inscription (email + mot_de_passe uniquement)
router.post('/register', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: "Email et mot de passe obligatoires." });
    }

    const existing = await Utilisateur.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }

    const user = await Utilisateur.create({
      email: email.trim().toLowerCase(),
      mot_de_passe,
      role: 'vendeur',
      statut: 'actif'
    });

    return res.status(201).json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: "Email et mot de passe obligatoires." });
    }

    const user = await Utilisateur.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user || user.mot_de_passe !== mot_de_passe) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    if (user.statut !== 'actif') {
      return res.status(403).json({ error: "Compte inactif" });
    }

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Création du superadmin (protéger avec SUPERADMIN_SECRET dans .env)
router.post('/create-superadmin', async (req, res) => {
  try {
    const { email, mot_de_passe, secret } = req.body;

    if (secret !== process.env.SUPERADMIN_SECRET) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: "Email et mot de passe obligatoires." });
    }

    const existing = await Utilisateur.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }

    const user = await Utilisateur.create({
      email: email.trim().toLowerCase(),
      mot_de_passe,
      role: 'superadmin',
      statut: 'actif'
    });

    return res.status(201).json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Suppression d'un superadmin (par id)
router.delete('/delete-superadmin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Utilisateur.findByPk(id);
    if (!user || user.role !== 'superadmin') {
      return res.status(404).json({ error: "Superadmin introuvable" });
    }
    await user.destroy();
    return res.json({ message: "Superadmin supprimé avec succès" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
