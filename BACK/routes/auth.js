// routes/auth.js - VERSION CORRIGÉE
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
    const { email, mot_de_passe, role, statut } = req.body;

    // ✅ Validation
    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: 'Email et mot de passe obligatoires.' });
    }

    // ✅ CORRIGÉ : Validation cohérente minimum 6 caractères (comme frontend)
    if (mot_de_passe.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    const emailClean = normalizeEmail(email);
    const pwdClean = normalizePassword(mot_de_passe);

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailClean)) {
      return res.status(400).json({ error: "Format d'email invalide." });
    }

    // Vérifier si l'email existe déjà
    const existing = await Utilisateur.findOne({ where: { email: emailClean } });
    if (existing) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }

    // ✅ Hachage sécurisé avec 12 rounds
    const hash = await bcrypt.hash(pwdClean, 12);

    // ✅ Création avec hooks désactivés pour éviter double hachage
    const user = await Utilisateur.create({
      email: emailClean,
      mot_de_passe: hash,
      role: role || 'vendeur',
      statut: statut || 'actif'
    }, {
      hooks: false // Désactiver les hooks Sequelize
    });

    // ✅ Génération du token
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // ✅ Réponse complète avec toutes les infos
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
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
  }
});

// --- CONNEXION ---
router.post('/login', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    // ✅ Validation
    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: 'Email et mot de passe obligatoires.' });
    }

    const emailClean = normalizeEmail(email);
    const pwdClean = normalizePassword(mot_de_passe);

    console.log('🔍 Tentative de connexion:', emailClean);

    // ✅ Recherche de l'utilisateur
    const user = await Utilisateur.findOne({ 
      where: { email: emailClean },
      attributes: ['id', 'email', 'mot_de_passe', 'role', 'statut', 'created_at']
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé:', emailClean);
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    console.log('✅ Utilisateur trouvé:', user.id, user.email);
    console.log('🔐 Hash stocké longueur:', user.mot_de_passe?.length);

    // ✅ Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(pwdClean, user.mot_de_passe);
    
    console.log('🔑 Mot de passe valide:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Mot de passe incorrect pour:', emailClean);
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    // ✅ Vérification du statut
    if (user.statut !== 'actif') {
      console.log('⚠️ Compte désactivé:', emailClean);
      return res.status(403).json({ error: 'Compte désactivé. Contactez l\'administrateur.' });
    }

    // ✅ Génération du token
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Connexion réussie:', emailClean);

    // ✅ Réponse complète
    res.json({
      message: 'Connexion réussie',
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
    console.error('❌ Erreur login:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
  }
});

module.exports = router;