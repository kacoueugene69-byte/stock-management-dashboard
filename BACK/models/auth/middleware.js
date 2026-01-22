// auth/middleware.js
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// Vérifie le token JWT et attache userId au req
async function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Vérifie que l'utilisateur a l'un des rôles requis
async function requireRole(roles = []) {
  return async (req, res, next) => {
    try {
      if (!req.userId) return res.status(401).json({ error: 'No user' });
      const { rows } = await pool.query('SELECT role, is_superadmin FROM utilisateurs WHERE id = $1', [req.userId]);
      if (!rows.length) return res.status(404).json({ error: 'User not found' });
      const user = rows[0];
      // superadmin bypass
      if (user.is_superadmin) return next();
      // check role
      if (roles.length === 0 || roles.includes(user.role)) return next();
      return res.status(403).json({ error: 'Forbidden' });
    } catch (err) {
      console.error('requireRole error', err);
      return res.status(500).json({ error: 'Server error' });
    }
  };
}

module.exports = { verifyToken, requireRole };
