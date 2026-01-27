const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { Utilisateur } = require('../models');

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.userId, {
      attributes: ['id', 'email', 'role', 'statut', 'created_at']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      statut: user.statut,
      createdAt: user.created_at
    });
  } catch (err) {
    console.error('GET /api/me error', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
