const express = require('express');
const router = express.Router();
const { Commande } = require('../models/index');

router.get('/', async (req, res) => {
  try {
    const commandes = await Commande.findAll();
    res.json(commandes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const commande = await Commande.create(req.body);
    res.status(201).json(commande);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
