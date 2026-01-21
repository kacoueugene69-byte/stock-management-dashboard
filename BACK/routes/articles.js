const express = require('express');
const router = express.Router();
const { Article, Categorie } = require('../models/index');

// GET tous les articles
router.get('/', async (req, res) => {
  try {
    const articles = await Article.findAll({ include: [Categorie] });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer un article
router.post('/', async (req, res) => {
  try {
    const article = await Article.create(req.body);
    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT modifier un article
router.put('/:id', async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).json({ error: "Article non trouvé" });
    await article.update(req.body);
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE supprimer un article
router.delete('/:id', async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).json({ error: "Article non trouvé" });
    await article.destroy();
    res.json({ message: "Article supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
