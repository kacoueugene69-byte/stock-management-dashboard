// routes/utilisateurs.js - VERSION CORRIGÉE
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { Utilisateur } = require('../models');
const { verifyToken } = require('../middleware/auth');

// ✅ Middleware pour protéger les routes (optionnel selon vos besoins)
// Décommentez si vous voulez protéger ces routes
// router.use(verifyToken);

// GET tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const users = await Utilisateur.findAll({
      attributes: { exclude: ['mot_de_passe'] },
      order: [['created_at', 'DESC']]
    });
    return res.json(users);
  } catch (err) {
    console.error('❌ Erreur GET users:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET un utilisateur par ID
router.get('/:id', async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id, {
      attributes: { exclude: ['mot_de_passe'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    return res.json(user);
  } catch (err) {
    console.error('❌ Erreur GET user by ID:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST créer un utilisateur
router.post('/', async (req, res) => {
  try {
    const { email, mot_de_passe, role, statut } = req.body;

    // ✅ Validation
    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: "Email et mot de passe obligatoires." });
    }

    // ✅ CORRIGÉ : Validation cohérente minimum 6 caractères
    if (mot_de_passe.length < 6) {
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères." });
    }

    const emailClean = email.trim().toLowerCase();

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailClean)) {
      return res.status(400).json({ error: "Format d'email invalide." });
    }

    // Vérifier si l'email existe déjà
    const existing = await Utilisateur.findOne({ where: { email: emailClean } });
    if (existing) {
      return res.status(409).json({ error: "Cet email est déjà utilisé." });
    }

    // ✅ Hacher le mot de passe avec 12 rounds
    const hashed = await bcrypt.hash(mot_de_passe.trim(), 12);

    // ✅ Créer l'utilisateur avec hooks désactivés
    const user = await Utilisateur.create({
      email: emailClean,
      mot_de_passe: hashed,
      role: role || 'vendeur',
      statut: statut || 'actif'
    }, {
      hooks: false // Désactiver les hooks pour éviter le double hachage
    });

    // Ne pas renvoyer le mot de passe
    const userResponse = user.toJSON();
    delete userResponse.mot_de_passe;

    console.log('✅ Utilisateur créé:', userResponse.email);

    return res.status(201).json(userResponse);
  } catch (err) {
    console.error('❌ Erreur POST user:', err);
    return res.status(500).json({ error: err.message });
  }
});

// PUT modifier un utilisateur
router.put('/:id', async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    const updates = { ...req.body };
    
    // Normaliser l'email si fourni
    if (updates.email) {
      const emailClean = updates.email.trim().toLowerCase();
      
      // Validation email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailClean)) {
        return res.status(400).json({ error: "Format d'email invalide." });
      }
      
      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      const existing = await Utilisateur.findOne({ 
        where: { 
          email: emailClean,
          id: { [require('sequelize').Op.ne]: req.params.id }
        } 
      });
      
      if (existing) {
        return res.status(409).json({ error: "Cet email est déjà utilisé." });
      }
      
      updates.email = emailClean;
    }

    // ✅ Si le mot de passe est modifié, le hacher
    if (updates.mot_de_passe) {
      // ✅ CORRIGÉ : Validation cohérente minimum 6 caractères
      if (updates.mot_de_passe.length < 6) {
        return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères." });
      }
      updates.mot_de_passe = await bcrypt.hash(updates.mot_de_passe.trim(), 12);
    }

    // ✅ Mettre à jour avec hooks désactivés
    await user.update(updates, { hooks: false });

    // Ne pas renvoyer le mot de passe
    const userResponse = user.toJSON();
    delete userResponse.mot_de_passe;

    console.log('✅ Utilisateur mis à jour:', userResponse.email);

    return res.json(userResponse);
  } catch (err) {
    console.error('❌ Erreur PUT user:', err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE supprimer un utilisateur
router.delete('/:id', async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    
    const userEmail = user.email;
    await user.destroy();
    
    console.log('✅ Utilisateur supprimé:', userEmail);
    
    return res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    console.error('❌ Erreur DELETE user:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;