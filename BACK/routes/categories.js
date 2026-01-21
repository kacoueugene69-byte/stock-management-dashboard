const express = require('express');
const router = express.Router();
const { Categorie } = require('../models/index');

// GET toutes les catégories
router.get('/', async (req, res) => {
  try {
    const categories = await Categorie.findAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer une catégorie
router.post('/', async (req, res) => {
  try {
    const categorie = await Categorie.create(req.body);
    res.status(201).json(categorie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT modifier une catégorie
router.put('/:id', async (req, res) => {
  try {
    const categorie = await Categorie.findByPk(req.params.id);
    if (!categorie) return res.status(404).json({ error: "Catégorie non trouvée" });
    await categorie.update(req.body);
    res.json(categorie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE supprimer une catégorie
router.delete('/:id', async (req, res) => {
  try {
    const categorie = await Categorie.findByPk(req.params.id);
    if (!categorie) return res.status(404).json({ error: "Catégorie non trouvée" });
    await categorie.destroy();
    res.json({ message: "Catégorie supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
