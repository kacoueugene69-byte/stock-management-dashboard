// routes/auth.js - VERSION ULTRA-CORRIGÉE AVEC LOGS DÉTAILLÉS
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const BCRYPT_ROUNDS = 12;

// Helpers
const normalizeEmail = (email) => email?.trim().toLowerCase();
const normalizePassword = (pwd) => pwd?.trim();

// --- INSCRIPTION ---
router.post('/register', async (req, res) => {
  const startTime = Date.now();
  console.log('\n🆕 ========== NOUVELLE INSCRIPTION ==========');
  
  try {
    const { email, mot_de_passe, role, statut } = req.body;
    console.log('📨 Données reçues:', { email, role, statut, mdp_length: mot_de_passe?.length });

    // Validation
    if (!email || !mot_de_passe) {
      console.log('❌ Validation échouée: champs manquants');
      return res.status(400).json({ error: 'Email et mot de passe obligatoires.' });
    }

    if (mot_de_passe.length < 6) {
      console.log('❌ Validation échouée: mot de passe trop court');
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    const emailClean = normalizeEmail(email);
    const pwdClean = normalizePassword(mot_de_passe);
    console.log('🧹 Données nettoyées:', { email: emailClean, mdp_length: pwdClean.length });

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailClean)) {
      console.log('❌ Format email invalide');
      return res.status(400).json({ error: "Format d'email invalide." });
    }

    // Vérifier si l'email existe déjà
    console.log('🔍 Vérification unicité email...');
    const existing = await Utilisateur.findOne({ where: { email: emailClean } });
    if (existing) {
      console.log('❌ Email déjà utilisé');
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }
    console.log('✅ Email disponible');

    // Hachage du mot de passe
    console.log('🔐 Hachage du mot de passe avec bcrypt (12 rounds)...');
    const hashStartTime = Date.now();
    const hash = await bcrypt.hash(pwdClean, BCRYPT_ROUNDS);
    console.log(`✅ Hash généré en ${Date.now() - hashStartTime}ms`);
    console.log(`   Longueur hash: ${hash.length} caractères`);
    console.log(`   Début hash: ${hash.substring(0, 20)}...`);
    console.log(`   Format: ${hash.substring(0, 4)}`);

    // Vérification immédiate du hash
    console.log('🧪 Test immédiat du hash...');
    const testVerify = await bcrypt.compare(pwdClean, hash);
    console.log(`   Test vérification: ${testVerify ? '✅ OK' : '❌ ÉCHEC'}`);
    
    if (!testVerify) {
      console.log('❌ ERREUR CRITIQUE: Le hash généré ne peut pas être vérifié!');
      return res.status(500).json({ error: 'Erreur lors de la création du compte (hash invalide)' });
    }

    // Création avec hooks DÉSACTIVÉS
    console.log('💾 Création utilisateur en base (hooks: false)...');
    const user = await Utilisateur.create({
      email: emailClean,
      mot_de_passe: hash,
      role: role || 'vendeur',
      statut: statut || 'actif'
    }, {
      hooks: false,
      validate: true
    });

    console.log('✅ Utilisateur créé:', {
      id: user.id,
      email: user.email,
      role: user.role,
      statut: user.statut
    });

    // Vérification post-création
    console.log('🔍 Vérification post-création...');
    const userCheck = await Utilisateur.findByPk(user.id);
    const hashInDb = userCheck.mot_de_passe;
    console.log(`   Hash en base (début): ${hashInDb.substring(0, 20)}...`);
    console.log(`   Longueur: ${hashInDb.length}`);
    console.log(`   Hash identique: ${hash === hashInDb ? '✅' : '❌'}`);
    
    if (hash !== hashInDb) {
      console.log('⚠️  WARNING: Le hash en base est différent du hash généré!');
      console.log('⚠️  Possible hook Sequelize actif malgré hooks:false');
    }

    // Test de connexion immédiat
    console.log('🧪 Test de connexion immédiat...');
    const loginTest = await bcrypt.compare(pwdClean, hashInDb);
    console.log(`   Test connexion: ${loginTest ? '✅ OK' : '❌ ÉCHEC'}`);

    // Génération du token
    console.log('🎫 Génération JWT...');
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('✅ Token généré');

    const duration = Date.now() - startTime;
    console.log(`⏱️  Inscription terminée en ${duration}ms`);
    console.log('==========================================\n');

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
    console.error('❌ ERREUR INSCRIPTION:', err);
    console.error('Stack:', err.stack);
    console.log('==========================================\n');
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
  }
});

// --- CONNEXION ---
router.post('/login', async (req, res) => {
  const startTime = Date.now();
  console.log('\n🔐 ========== TENTATIVE DE CONNEXION ==========');
  
  try {
    const { email, mot_de_passe } = req.body;
    console.log('📨 Données reçues:', { email, mdp_length: mot_de_passe?.length });

    // Validation
    if (!email || !mot_de_passe) {
      console.log('❌ Validation échouée: champs manquants');
      return res.status(400).json({ error: 'Email et mot de passe obligatoires.' });
    }

    const emailClean = normalizeEmail(email);
    const pwdClean = normalizePassword(mot_de_passe);
    console.log('🧹 Données nettoyées:', { email: emailClean, mdp_length: pwdClean.length });

    // Recherche utilisateur
    console.log('🔍 Recherche utilisateur en base...');
    const user = await Utilisateur.findOne({ 
      where: { email: emailClean }
    });

    if (!user) {
      console.log(`❌ Utilisateur non trouvé: ${emailClean}`);
      console.log('💡 Suggestion: Vérifier l\'orthographe de l\'email');
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    console.log('✅ Utilisateur trouvé:', {
      id: user.id,
      email: user.email,
      role: user.role,
      statut: user.statut
    });

    // Analyse du hash
    const hash = user.mot_de_passe;
    console.log('🔬 Analyse du hash:');
    console.log(`   Hash (début): ${hash.substring(0, 20)}...`);
    console.log(`   Longueur: ${hash.length} caractères`);
    console.log(`   Format: ${hash.substring(0, 4)}`);
    
    const isBcryptFormat = hash.startsWith('$2b$') || hash.startsWith('$2a$') || hash.startsWith('$2y$');
    console.log(`   Format bcrypt: ${isBcryptFormat ? '✅' : '❌'}`);
    
    if (!isBcryptFormat) {
      console.log('❌ ERREUR: Hash non valide (pas au format bcrypt)');
      console.log('💡 Le mot de passe n\'a pas été haché correctement');
      return res.status(500).json({ 
        error: 'Erreur de configuration du compte. Veuillez contacter l\'administrateur.' 
      });
    }

    // Vérification du statut
    if (user.statut !== 'actif') {
      console.log(`⚠️  Compte désactivé: ${user.statut}`);
      return res.status(403).json({ error: 'Compte désactivé. Contactez l\'administrateur.' });
    }

    // Vérification du mot de passe
    console.log('🔑 Vérification du mot de passe avec bcrypt...');
    const verifyStartTime = Date.now();
    
    let isPasswordValid;
    try {
      isPasswordValid = await bcrypt.compare(pwdClean, hash);
      console.log(`   Vérification terminée en ${Date.now() - verifyStartTime}ms`);
      console.log(`   Résultat: ${isPasswordValid ? '✅ VALIDE' : '❌ INVALIDE'}`);
    } catch (bcryptError) {
      console.error('❌ Erreur bcrypt.compare:', bcryptError);
      return res.status(500).json({ error: 'Erreur lors de la vérification' });
    }

    if (!isPasswordValid) {
      console.log('❌ Mot de passe incorrect');
      console.log('💡 Suggestions:');
      console.log('   • Vérifier les espaces avant/après');
      console.log('   • Vérifier la casse (majuscules/minuscules)');
      console.log('   • Essayer de réinitialiser le mot de passe');
      
      // Test avec variations communes
      console.log('🧪 Test avec variations du mot de passe...');
      const variations = [
        pwdClean.toLowerCase(),
        pwdClean.toUpperCase(),
        pwdClean.replace(/\s+/g, ''),
      ];
      
      for (const variation of variations) {
        if (variation !== pwdClean) {
          const testResult = await bcrypt.compare(variation, hash);
          if (testResult) {
            console.log(`   ⚠️  Match trouvé avec variation: "${variation}"`);
          }
        }
      }
      
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    console.log('✅ Authentification réussie!');

    // Génération du token
    console.log('🎫 Génération JWT...');
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('✅ Token généré');

    // Mise à jour dernière connexion
    try {
      await user.update({ derniere_connexion: new Date() }, { hooks: false });
      console.log('✅ Dernière connexion mise à jour');
    } catch (updateErr) {
      console.log('⚠️  Erreur mise à jour dernière connexion:', updateErr.message);
    }

    const duration = Date.now() - startTime;
    console.log(`⏱️  Connexion terminée en ${duration}ms`);
    console.log('=============================================\n');

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
    console.error('❌ ERREUR CONNEXION:', err);
    console.error('Stack:', err.stack);
    console.log('=============================================\n');
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
  }
});

module.exports = router;