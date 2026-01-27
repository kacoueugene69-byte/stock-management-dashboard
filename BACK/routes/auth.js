// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// Helpers
const normalizeEmail = (email) => email?.trim().toLowerCase();
const normalizePassword = (pwd) => pwd?.trim();

// --- INSCRIPTION ---
router.post('/register', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: 'Email et mot de passe obligatoires.' });
    }

    if (mot_de_passe.length < 8) {
      return res.status(400).json({ error: 'Mot de passe trop court (min 8 caractères).' });
    }

    const emailClean = normalizeEmail(email);
    const pwdClean = normalizePassword(mot_de_passe);

    const existing = await Utilisateur.findOne({ where: { email: emailClean } });
    if (existing) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }

    const hash = await bcrypt.hash(pwdClean, 12);

    const user = await Utilisateur.create({
      email: emailClean,
      mot_de_passe: hash,
      role: 'vendeur',
      statut: 'actif'
    });

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Erreur inscription:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
  }
});

// --- CONNEXION ---
router.post('/login', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: 'Email et mot de passe obligatoires.' });
    }

    const emailClean = normalizeEmail(email);
    const pwdClean = normalizePassword(mot_de_passe);

    const user = await Utilisateur.findOne({ where: { email: emailClean } });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const ok = await bcrypt.compare(pwdClean, user.mot_de_passe);
    if (!ok) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    if (user.statut !== 'actif') {
      return res.status(403).json({ error: 'Compte désactivé. Contactez l\'administrateur.' });
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Erreur login:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
  }
});

module.exports = router;
