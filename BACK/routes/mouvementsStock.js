const express = require('express');
const router = express.Router();
const { MouvementStock, Article, Magasin } = require('../models/index');

// GET tous les mouvements de stock
router.get('/', async (req, res) => {
  try {
    const mouvements = await MouvementStock.findAll({ include: [Article, Magasin] });
    res.json(mouvements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer un mouvement de stock
router.post('/', async (req, res) => {
  try {
    const mouvement = await MouvementStock.create(req.body);
    res.status(201).json(mouvement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT modifier un mouvement de stock
router.put('/:id', async (req, res) => {
  try {
    const mouvement = await MouvementStock.findByPk(req.params.id);
    if (!mouvement) return res.status(404).json({ error: "Mouvement non trouvé" });
    await mouvement.update(req.body);
    res.json(mouvement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE supprimer un mouvement de stock
router.delete('/:id', async (req, res) => {
  try {
    const mouvement = await MouvementStock.findByPk(req.params.id);
    if (!mouvement) return res.status(404).json({ error: "Mouvement non trouvé" });
    await mouvement.destroy();
    res.json({ message: "Mouvement supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
