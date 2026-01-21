// routes/utilisateurs.js
const express = require('express');
const router = express.Router();
const { Utilisateur, Personnel } = require('../models/index');

// GET tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const users = await Utilisateur.findAll({ include: [Personnel] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer un utilisateur
router.post('/', async (req, res) => {
  try {
    const user = await Utilisateur.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT modifier un utilisateur
router.put('/:id', async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    await user.update(req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE supprimer un utilisateur
router.delete('/:id', async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    await user.destroy();
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
