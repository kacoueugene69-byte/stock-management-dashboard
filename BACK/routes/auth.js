const express = require('express');
const router = express.Router();
const { Utilisateur } = require('../models');

// ✅ Route d'inscription (vendeur par défaut)
router.post('/register', async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe } = req.body;

    const existing = await Utilisateur.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }

    const user = await Utilisateur.create({
      nom_utilisateur: `${prenom}.${nom}`.toLowerCase(),
      nom,
      prenom,
      email,
      mot_de_passe,
      role: 'vendeur',   // 👈 rôle par défaut
      statut: 'actif'
    });

    return res.status(201).json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ✅ Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    const user = await Utilisateur.findOne({ where: { email } });
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

// ✅ Route spéciale pour créer un superadmin
router.post('/create-superadmin', async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe, secret } = req.body;

    if (secret !== process.env.SUPERADMIN_SECRET) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    const existing = await Utilisateur.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }

    const user = await Utilisateur.create({
      nom_utilisateur: `${prenom}.${nom}`.toLowerCase(),
      nom,
      prenom,
      email,
      mot_de_passe,
      role: 'superadmin',   // 👈 rôle spécial
      statut: 'actif'
    });

    return res.status(201).json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ✅ Suppression du superadmin
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
