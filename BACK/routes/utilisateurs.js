// routes/utilisateurs.js
const express = require('express');
const router = express.Router();
const { Utilisateur, Personnel } = require('../models');

// ============================================
// GET tous les utilisateurs
// ============================================
router.get('/', async (req, res) => {
  try {
    const users = await Utilisateur.findAll({
      include: [{ model: Personnel }] // ✅ inclut les relations si définies
    });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ============================================
// POST créer un utilisateur
// ============================================
router.post('/', async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe, role, statut } = req.body;

    // ✅ Validation basique
    if (!nom || !prenom || !email || !mot_de_passe) {
      return res.status(400).json({ error: "Tous les champs obligatoires doivent être remplis." });
    }

    // ✅ Vérifie si l'email existe déjà
    const existing = await Utilisateur.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }

    const user = await Utilisateur.create({
      nom,
      prenom,
      email,
      mot_de_passe,
      role: role || 'vendeur',   // 👈 rôle par défaut si non fourni
      statut: statut || 'actif'  // 👈 statut par défaut
    });

    return res.status(201).json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ============================================
// PUT modifier un utilisateur
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    await user.update(req.body);
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ============================================
// DELETE supprimer un utilisateur
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    await user.destroy();
    return res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
