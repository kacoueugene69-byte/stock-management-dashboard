const express = require('express');
const router = express.Router();
const { Magasin } = require('../models/index');

// GET tous les magasins
router.get('/', async (req, res) => {
  try {
    const magasins = await Magasin.findAll();
    res.json(magasins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer un magasin
router.post('/', async (req, res) => {
  try {
    const { nom, adresse, statut } = req.body;

    if (!nom) {
      return res.status(400).json({ error: "Le nom du magasin est obligatoire" });
    }

    const magasin = await Magasin.create({
      nom,
      adresse,
      statut: statut || 'actif'
    });

    res.status(201).json(magasin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT modifier un magasin
router.put('/:id', async (req, res) => {
  try {
    const magasin = await Magasin.findByPk(req.params.id);
    if (!magasin) return res.status(404).json({ error: "Magasin non trouvé" });

    await magasin.update(req.body);
    res.json(magasin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE supprimer un magasin
router.delete('/:id', async (req, res) => {
  try {
    const magasin = await Magasin.findByPk(req.params.id);
    if (!magasin) return res.status(404).json({ error: "Magasin non trouvé" });

    await magasin.destroy();
    res.json({ message: "Magasin supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
