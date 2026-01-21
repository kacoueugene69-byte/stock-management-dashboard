const express = require('express');
const router = express.Router();
const { Utilisateur } = require('../models');

router.post('/register', async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe } = req.body;
    const utilisateur = await Utilisateur.create({ nom, prenom, email, mot_de_passe });
    res.status(201).json({ user: utilisateur });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
