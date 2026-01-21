const express = require('express');
const router = express.Router();
const { Client } = require('../models/index');

router.get('/', async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ error: "Client non trouvé" });
    await client.update(req.body);
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ error: "Client non trouvé" });
    await client.destroy();
    res.json({ message: "Client supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
