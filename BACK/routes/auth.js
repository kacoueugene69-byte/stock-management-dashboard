// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Utilisateur } = require('../models'); // adapte le chemin si besoin

const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

// Helper : retire mot_de_passe avant d'envoyer l'utilisateur
function safeUser(userInstance) {
  if (!userInstance) return null;
  const u = userInstance.toJSON ? userInstance.toJSON() : { ...userInstance };
  delete u.mot_de_passe;
  return u;
}

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    if (!email || !mot_de_passe) return res.status(400).json({ error: "Email et mot_de_passe obligatoires." });

    const existing = await Utilisateur.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existing) return res.status(400).json({ error: "Cet email est déjà utilisé." });

    const hashed = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);
    const user = await Utilisateur.create({
      email: email.trim().toLowerCase(),
      mot_de_passe: hashed,
      role: 'vendeur',
      statut: 'actif'
    });

    return res.status(201).json({ user: safeUser(user) });
  } catch (err) {
    console.error('REGISTER ERROR', err);
    return res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    if (!email || !mot_de_passe) return res.status(400).json({ error: "Email et mot_de_passe obligatoires." });

    const user = await Utilisateur.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) return res.status(401).json({ error: "Identifiants incorrects" });

    const match = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!match) return res.status(401).json({ error: "Identifiants incorrects" });

    if (user.statut !== 'actif') return res.status(403).json({ error: "Compte inactif" });

    return res.json({ user: safeUser(user) });
  } catch (err) {
    console.error('LOGIN ERROR', err);
    return res.status(500).json({ error: err.message });
  }
});

// CREATE SUPERADMIN (protégé par secret)
router.post('/create-superadmin', async (req, res) => {
  try {
    const { email, mot_de_passe, secret } = req.body;
    if (secret !== process.env.SUPERADMIN_SECRET) return res.status(403).json({ error: "Accès interdit" });
    if (!email || !mot_de_passe) return res.status(400).json({ error: "Email et mot_de_passe obligatoires." });

    const existing = await Utilisateur.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existing) return res.status(400).json({ error: "Cet email est déjà utilisé." });

    const hashed = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);
    const user = await Utilisateur.create({
      email: email.trim().toLowerCase(),
      mot_de_passe: hashed,
      role: 'superadmin',
      statut: 'actif'
    });

    return res.status(201).json({ user: safeUser(user) });
  } catch (err) {
    console.error('CREATE SUPERADMIN ERROR', err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE SUPERADMIN (par id)
router.delete('/delete-superadmin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Utilisateur.findByPk(id);
    if (!user || user.role !== 'superadmin') return res.status(404).json({ error: "Superadmin introuvable" });
    await user.destroy();
    return res.json({ message: "Superadmin supprimé avec succès" });
  } catch (err) {
    console.error('DELETE SUPERADMIN ERROR', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
