const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { verifyToken } = require('../auth/middleware');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.get('/me', verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, role, statut, created_at FROM utilisateurs WHERE id = $1',
      [req.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    const u = rows[0];
    res.json({
      id: u.id,
      email: u.email,
      role: u.role,
      statut: u.statut,
      createdAt: u.created_at
    });
  } catch (err) {
    console.error('GET /api/me error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
