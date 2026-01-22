// routes/utilisateurs.js
const express = require('express');
const router = express.Router();
const { Utilisateur } = require('../models');

// GET tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const users = await Utilisateur.findAll();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST créer un utilisateur (email + mot_de_passe)
router.post('/', async (req, res) => {
  try {
    const { email, mot_de_passe, role, statut } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: "Email et mot de passe obligatoires." });
    }

    const existing = await Utilisateur.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existing) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }

    const user = await Utilisateur.create({
      email: email.trim().toLowerCase(),
      mot_de_passe,
      role: role || 'vendeur',
      statut: statut || 'actif'
    });

    return res.status(201).json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT modifier un utilisateur
router.put('/:id', async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const updates = req.body;
    if (updates.email) updates.email = updates.email.trim().toLowerCase();

    await user.update(updates);
    return res.json(user);
  } catch (err) {
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
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
