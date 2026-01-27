// server.js
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pkg from 'pg';

const { Pool } = pkg;



// Middleware
app.use(cors());
app.use(express.json());

// Configuration PostgreSQL (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test de connexion
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err.stack);
  } else {
    console.log('✅ Connecté à Neon PostgreSQL');
    release();
  }
});

// ============================================
// ROUTES D'AUTHENTIFICATION
// ============================================

// --- INSCRIPTION ---
app.post('/api/auth/register', async (req, res) => {
  const { email, mot_de_passe } = req.body;

  if (!email || !mot_de_passe) {
    return res.status(400).json({ error: "Email et mot de passe obligatoires." });
  }

  const emailClean = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailClean)) {
    return res.status(400).json({ error: "Format d'email invalide." });
  }

  if (mot_de_passe.length < 8) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const emailCheck = await client.query(
      'SELECT id FROM utilisateurs WHERE LOWER(email) = LOWER($1)',
      [emailClean]
    );

    if (emailCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: "Cet email est déjà utilisé." });
    }

    const hash = await bcrypt.hash(mot_de_passe.trim(), 12);

    const insertUser = `
      INSERT INTO utilisateurs (email, mot_de_passe, role, statut, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, email, role, statut, created_at
    `;
    const userRes = await client.query(insertUser, [
      emailClean,
      hash,
      'vendeur',
      'actif'
    ]);

    await client.query('COMMIT');

    const userData = userRes.rows[0];

    res.status(201).json({
      message: "Compte créé avec succès",
      user: userData
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erreur inscription:', err);
    res.status(500).json({ error: "Erreur lors de la création du compte" });
  } finally {
    client.release();
  }
});

// --- CONNEXION ---
app.post('/api/auth/login', async (req, res) => {
  const { email, mot_de_passe } = req.body;

  if (!email || !mot_de_passe) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  try {
    const query = `
      SELECT id, email, mot_de_passe
      FROM utilisateurs
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `;
    const result = await pool.query(query, [email.trim().toLowerCase()]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const user = result.rows[0];

    const isValid = await bcrypt.compare(mot_de_passe.trim(), user.mot_de_passe);
    if (!isValid) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Erreur login:', err);
    res.status(500).json({ error: "Erreur serveur lors de la connexion" });
  }
});


// ============================================
// ROUTES ARTICLES
// ============================================

// GET tous les articles
app.get('/api/articles', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, c.nom_categorie 
      FROM articles a
      LEFT JOIN categories c ON a.id_categorie = c.identifiant
      ORDER BY a.créé_à DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET articles:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des articles' });
  }
});

// POST créer un article
app.post('/api/articles', async (req, res) => {
  const { 
    code_article, nom_article, quantite_stock, seuil_alerte, 
    statut, type_conditionnement, prix_achat, prix_vente, 
    poids, id_categorie 
  } = req.body;

  try {
    const query = `
      INSERT INTO articles (
        code_article, nom_article, quantite_stock, seuil_alerte,
        statut, type_conditionnement, prix_achat, prix_vente,
        poids, id_categorie, créé_à, modifié_à
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *
    `;
    
    const values = [
      code_article, nom_article, quantite_stock || 0, seuil_alerte || 5,
      statut || 'actif', type_conditionnement || 'unité', 
      prix_achat || 0, prix_vente || 0, poids || 0, id_categorie || null
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur POST article:', err);
    res.status(500).json({ error: 'Erreur lors de la création de l\'article' });
  }
});

// PUT mettre à jour un article
app.put('/api/articles/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    nom_article, quantite_stock, seuil_alerte, 
    statut, type_conditionnement, prix_achat, prix_vente, 
    poids, id_categorie 
  } = req.body;

  try {
    const query = `
      UPDATE articles SET
        nom_article = $1, quantite_stock = $2, seuil_alerte = $3,
        statut = $4, type_conditionnement = $5, prix_achat = $6,
        prix_vente = $7, poids = $8, id_categorie = $9, modifié_à = NOW()
      WHERE identifiant = $10
      RETURNING *
    `;
    
    const values = [
      nom_article, quantite_stock, seuil_alerte,
      statut, type_conditionnement, prix_achat,
      prix_vente, poids, id_categorie || null, id
    ];

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur PUT article:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'article' });
  }
});

// DELETE supprimer un article
app.delete('/api/articles/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM articles WHERE identifiant = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    
    res.json({ message: 'Article supprimé avec succès', article: result.rows[0] });
  } catch (err) {
    console.error('Erreur DELETE article:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'article' });
  }
});

// ============================================
// ROUTES CATEGORIES
// ============================================

app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY nom_categorie');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET categories:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
  }
});

// ============================================
// ROUTES MAGASINS
// ============================================

app.get('/api/magasins', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM magasin ORDER BY nom_magasin');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET magasins:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des magasins' });
  }
});

// ============================================
// ROUTES STATS
// ============================================

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_ventes,
        COALESCE(SUM(montant_total), 0) as revenu_total
      FROM ventes
      WHERE DATE(date_vente) = CURRENT_DATE
    `);
    
    res.json({
      totalSalesCount: parseInt(stats.rows[0].total_ventes) || 0,
      totalRevenue: parseFloat(stats.rows[0].revenu_total) || 0,
      totalCost: 0,
      totalProfit: 0
    });
  } catch (err) {
    console.error('Erreur GET stats:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API fonctionnelle' });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

export default app;