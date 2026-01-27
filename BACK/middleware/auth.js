const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant ou invalide' });
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await Utilisateur.findByPk(decoded.sub);
    
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    if (user.statut !== 'actif') {
      return res.status(403).json({ error: 'Compte désactivé' });
    }

    req.userId = user.id;
    req.userEmail = user.email;
    req.userRole = user.role;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalide' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré' });
    }
    
    console.error('Erreur middleware auth:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { verifyToken };
