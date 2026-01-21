const express = require('express');
const router = express.Router();
const { Facture, Vente } = require('../models/index');

router.get('/', async (req, res) => {
  try {
    const factures = await Facture.findAll({ include: [Vente] });
    res.json(factures);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const facture = await Facture.create(req.body);
    res.status(201).json(facture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
