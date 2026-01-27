// backend/routes/auth.js - VERSION CORRIGÉE
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise';

// --- INSCRIPTION ---
router.post('/register', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    
    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: 'Email et mot de passe obligatoires.' });
    }
    
    if (mot_de_passe.length < 6) {
      return res.status(400).json({ error: 'Mot de passe trop court (min 6 caractères).' });
    }

    const existing = await Utilisateur.findOne({ 
      where: { email: email.trim().toLowerCase() } 
    });
    
    if (existing) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }

    const hash = await bcrypt.hash(mot_de_passe.trim(), 12);
    const user = await Utilisateur.create({
      email: email.trim().toLowerCase(),
      mot_de_passe: hash,
      role: 'vendeur',
      statut: 'actif'
    });

    const token = jwt.sign({ 
      sub: user.id, 
      email: user.email 
    }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ 
      message: 'Inscription réussie', 
      token, 
      user: { 
        id: user.id, 
        email: user.email,
        role: user.role,
        statut: user.statut,
        created_at: user.created_at
      } 
    });
  } catch (err) {
    console.error('❌ Erreur inscription:', err);
    res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
  }
});

// --- CONNEXION ---
router.post('/login', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    
    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: 'Email et mot de passe obligatoires.' });
    }

    const user = await Utilisateur.findOne({ 
      where: { email: email.trim().toLowerCase() } 
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const ok = await bcrypt.compare(mot_de_passe.trim(), user.mot_de_passe);
    
    if (!ok) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    if (user.statut !== 'actif') {
      return res.status(403).json({ error: 'Compte désactivé.' });
    }

    // Mettre à jour la dernière connexion
    await user.update({ derniere_connexion: new Date() });

    const token = jwt.sign({ 
      sub: user.id, 
      email: user.email 
    }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ 
      message: 'Connexion réussie', 
      token, 
      user: { 
        id: user.id, 
        email: user.email,
        role: user.role,
        statut: user.statut,
        created_at: user.created_at,
        derniere_connexion: user.derniere_connexion
      } 
    });
  } catch (err) {
    console.error('❌ Erreur connexion:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
  }
});

module.exports = router;