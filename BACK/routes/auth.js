const express = require('express');
const router = express.Router();
const { Utilisateur } = require('../models');

// POST /api/auth/register - Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: "Email et mot de passe obligatoires." });
    }

    if (mot_de_passe.length < 6) {
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères." });
    }

    const existing = await Utilisateur.findOne({ 
      where: { email: email.trim().toLowerCase() } 
    });

    if (existing) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }

    const user = await Utilisateur.create({
      email: email.trim().toLowerCase(),
      mot_de_passe,
      role: 'vendeur',
      statut: 'actif'
    });

    const userResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      statut: user.statut,
      created_at: user.created_at
    };

    return res.status(201).json({ 
      message: "Compte créé avec succès",
      user: userResponse 
    });
  } catch (err) {
    console.error('Erreur inscription:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login - Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: "Email et mot de passe obligatoires." });
    }

    const user = await Utilisateur.findOne({ 
      where: { email: email.trim().toLowerCase() } 
    });

    if (!user) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    if (user.statut !== 'actif') {
      return res.status(403).json({ error: "Compte désactivé. Contactez l'administrateur." });
    }

    if (typeof user.verifierMotDePasse !== 'function') {
      return res.status(500).json({ error: "Méthode de vérification du mot de passe manquante." });
    }

    const motDePasseValide = await user.verifierMotDePasse(mot_de_passe);
    
    if (!motDePasseValide) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      statut: user.statut,
      created_at: user.created_at
    };

    return res.json({ 
      message: "Connexion réussie",
      user: userResponse 
    });
  } catch (err) {
    console.error('Erreur connexion:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
