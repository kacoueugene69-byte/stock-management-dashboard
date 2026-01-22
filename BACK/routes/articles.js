// routes/articles.js
const express = require('express');
const router = express.Router();
const { Article, Categorie } = require('../models/index'); // assure-toi que models/index exporte Article et Categorie

// Champs autorisés pour create/update (whitelist)
const ALLOWED_FIELDS = [
  'article_code',
  'nom_article',
  'prix_achat',
  'prix_vente',
  'quantite_stock',
  'seuil_alerte',
  'id_categorie',
  'statut',
  'description'
];

function pickAllowed(body) {
  const out = {};
  for (const key of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      out[key] = body[key];
    }
  }
  return out;
}

// GET tous les articles (avec catégorie si existante)
router.get('/', async (req, res) => {
  try {
    const articles = await Article.findAll({
      include: [
        {
          model: Categorie,
          as: 'Categorie', // adapte si tu as un alias différent
          required: false
        }
      ]
    });
    res.json(articles);
  } catch (err) {
    console.error('GET /articles error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET article par identifiant
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id, {
      include: [{ model: Categorie, as: 'Categorie', required: false }]
    });
    if (!article) return res.status(404).json({ error: 'Article non trouvé' });
    res.json(article);
  } catch (err) {
    console.error('GET /articles/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST créer un article
router.post('/', async (req, res) => {
  try {
    const payload = pickAllowed(req.body);

    // validations minimales
    if (!payload.article_code || !payload.nom_article || !payload.prix_vente) {
      return res.status(400).json({ error: 'article_code, nom_article et prix_vente sont requis' });
    }

    // conversions simples
    if (payload.prix_achat !== undefined) payload.prix_achat = Number(payload.prix_achat) || 0;
    if (payload.prix_vente !== undefined) payload.prix_vente = Number(payload.prix_vente) || 0;
    if (payload.quantite_stock !== undefined) payload.quantite_stock = parseInt(payload.quantite_stock, 10) || 0;
    if (payload.seuil_alerte !== undefined) payload.seuil_alerte = parseInt(payload.seuil_alerte, 10) || 0;
    if (payload.id_categorie !== undefined && payload.id_categorie !== null) payload.id_categorie = parseInt(payload.id_categorie, 10) || null;

    const article = await Article.create(payload);
    res.status(201).json(article);
  } catch (err) {
    console.error('POST /articles error:', err);
    // gestion d'erreur pour contrainte unique
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Un article avec ce code existe déjà' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT modifier un article
router.put('/:id', async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article non trouvé' });

    const payload = pickAllowed(req.body);

    // conversions simples
    if (payload.prix_achat !== undefined) payload.prix_achat = Number(payload.prix_achat) || 0;
    if (payload.prix_vente !== undefined) payload.prix_vente = Number(payload.prix_vente) || 0;
    if (payload.quantite_stock !== undefined) payload.quantite_stock = parseInt(payload.quantite_stock, 10) || 0;
    if (payload.seuil_alerte !== undefined) payload.seuil_alerte = parseInt(payload.seuil_alerte, 10) || 0;
    if (payload.id_categorie !== undefined && payload.id_categorie !== null) payload.id_categorie = parseInt(payload.id_categorie, 10) || null;

    await article.update(payload);
    res.json(article);
  } catch (err) {
    console.error('PUT /articles/:id error:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Un article avec ce code existe déjà' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE supprimer un article
router.delete('/:id', async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article non trouvé' });
    await article.destroy();
    res.json({ message: 'Article supprimé avec succès' });
  } catch (err) {
    console.error('DELETE /articles/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
