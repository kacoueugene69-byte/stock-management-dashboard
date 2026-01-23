const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// ✅ Vérifie le token JWT et attache userId au req
async function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

// ✅ Vérifie que l'utilisateur a l'un des rôles requis
function requireRole(roles = []) {
  return async (req, res, next) => {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Utilisateur non authentifié' });

      const { rows } = await pool.query(
        'SELECT role FROM utilisateurs WHERE id = $1',
        [req.userId]
      );

      if (!rows.length) return res.status(404).json({ error: 'Utilisateur introuvable' });

      const user = rows[0];

      // ✅ Si aucun rôle requis, ou si le rôle de l'utilisateur est autorisé
      if (roles.length === 0 || roles.includes(user.role)) {
        return next();
      }

      return res.status(403).json({ error: 'Accès interdit' });
    } catch (err) {
      console.error('Erreur requireRole:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  };
}

module.exports = { verifyToken, requireRole };
