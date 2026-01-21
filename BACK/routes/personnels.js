const express = require('express');
const router = express.Router();
const { Personnel, Magasin } = require('../models/index');

// GET tout le personnel
router.get('/', async (req, res) => {
  try {
    const staff = await Personnel.findAll({ include: [Magasin] });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer un personnel
router.post('/', async (req, res) => {
  try {
    const matricule = 'MAT' + Date.now();
    const personnel = await Personnel.create({ ...req.body, matricule });
    res.status(201).json(personnel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT modifier un personnel
router.put('/:id', async (req, res) => {
  try {
    const personnel = await Personnel.findByPk(req.params.id);
    if (!personnel) return res.status(404).json({ error: "Personnel non trouvé" });
    await personnel.update(req.body);
    res.json(personnel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE supprimer un personnel
router.delete('/:id', async (req, res) => {
  try {
    const personnel = await Personnel.findByPk(req.params.id);
    if (!personnel) return res.status(404).json({ error: "Personnel non trouvé" });
    await personnel.destroy();
    res.json({ message: "Personnel supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
