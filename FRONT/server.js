
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Configuration de la connexion PostgreSQL
// Utilisez vos identifiants locaux ici ou via un fichier .env
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'gstock_db',
  password: process.env.DB_PASSWORD || 'votre_mot_de_passe',
  port: process.env.DB_PORT || 5432,
});

app.use(cors());
app.use(express.json());

// --- ROUTES POUR LES ARTICLES ---

// Récupérer tous les articles
app.get('/api/articles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM articles ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur lors de la récupération des articles');
  }
});

// Ajouter un article
app.post('/api/articles', async (req, res) => {
  try {
    const { 
      code_article, nom_article, id_categorie, prix_achat, 
      prix_vente, quantite_stock, statut, poids, 
      type_conditionnement, seuil_alerte, description 
    } = req.body;

    const newArticle = await pool.query(
      `INSERT INTO articles (
        code_article, nom_article, id_categorie, prix_achat, 
        prix_vente, quantite_stock, statut, poids, 
        type_conditionnement, seuil_alerte, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        code_article, nom_article, id_categorie, prix_achat, 
        prix_vente, quantite_stock, statut, poids, 
        type_conditionnement, seuil_alerte, description
      ]
    );

    res.json(newArticle.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur lors de l\'ajout de l\'article');
  }
});

// Supprimer un article
app.delete('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM articles WHERE id = $1', [id]);
    res.json({ message: "Article supprimé" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur lors de la suppression');
  }
});

app.listen(port, () => {
  console.log(`Le serveur backend tourne sur http://localhost:${port}`);
});
