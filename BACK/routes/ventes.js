const express = require('express');
const router = express.Router();
const { Vente, VenteArticle, Article, Client } = require('../models/index');

// GET toutes les ventes
router.get('/', async (req, res) => {
  try {
    const ventes = await Vente.findAll({ include: [Client, VenteArticle] });
    res.json(ventes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer une vente avec articles
router.post('/', async (req, res) => {
  const { id_client, nom_client_libre, montant_total, montant_paye, mode_paiement, statut_paiement, nom_vendeur, articles } = req.body;
  try {
    const vente = await Vente.create({ id_client, nom_client_libre, montant_total, montant_paye, mode_paiement, statut_paiement, nom_vendeur });
    for (const art of articles) {
      await VenteArticle.create({
        id_vente: vente.id,
        id_article: art.id_article,
        quantite: art.quantite,
        prix_unitaire: art.prix_unitaire
      });
    }
    res.status(201).json({ message: "Vente enregistrée", venteId: vente.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
