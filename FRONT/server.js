const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'gstock_db',
  password: process.env.DB_PASSWORD || 'admin',
  port: process.env.DB_PORT || 5432,
});

app.use(cors());
app.use(express.json());

// --- AUTHENTIFICATION ---
app.post('/api/auth/login', async (req, res) => {
  const { nom_utilisateur, mot_de_passe } = req.body;
  try {
    const result = await pool.query(
      'SELECT id, nom_utilisateur, email, role FROM utilisateurs WHERE nom_utilisateur = $1 AND mot_de_passe = $2',
      [nom_utilisateur, mot_de_passe]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ message: 'Identifiants incorrects' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ARTICLES ---
app.get('/api/articles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM articles ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/articles', async (req, res) => {
  const { code_article, nom_article, prix_vente, quantite_stock } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO articles (code_article, nom_article, prix_vente, quantite_stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [code_article, nom_article, prix_vente, quantite_stock]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/articles/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM articles WHERE id = $1', [req.params.id]);
    res.json({ message: "Article supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CATEGORIES ---
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});