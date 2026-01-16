const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Configuration de la base de données
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'gstock_db',
  password: process.env.DB_PASSWORD || 'admin',
  port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(cors());
app.use(express.json());

// ==================== MIDDLEWARE ====================

// CORS Configuration - IMPORTANT pour communiquer avec le front
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ==================== ROUTES DE SANTÉ ====================

app.get('/', (req, res) => {
  res.json({ message: '✅ Backend CDCOM-FACI is running!' });
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, message: 'Database connection OK' });
  } catch (e) {
    console.error('❌ Health check error:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ==================== ROUTES AUTHENTIFICATION ====================

app.post('/api/auth/login', async (req, res) => {
  const { nom_utilisateur, mot_de_passe } = req.body;
  try {
    // Jointure avec personnel pour récupérer le magasin de l'utilisateur
    const query = `
      SELECT u.id, u.nom_utilisateur, u.role, p.nom, p.prenom, p.id_magasin
      FROM utilisateurs u
      JOIN personnels p ON u.id_personnel = p.id
      WHERE u.nom_utilisateur = $1 AND u.mot_de_passe = $2 AND u.statut = 'actif'
    `;
    const result = await pool.query(query, [nom_utilisateur, mot_de_passe]);

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: "Identifiants invalides ou compte inactif" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ROUTES ARTICLES ====================

// Récupérer les articles avec le nom de leur catégorie
app.get('/api/articles', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, c.nom_categorie 
      FROM articles a 
      LEFT JOIN categories c ON a.id_categorie = c.id 
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ajouter un article
app.post('/api/articles', async (req, res) => {
  const { 
    code_article, nom_article, id_categorie, prix_achat, 
    prix_vente, quantite_stock, statut, poids, 
    type_conditionnement, seuil_alerte, description 
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO articles (
        code_article, nom_article, id_categorie, prix_achat, 
        prix_vente, quantite_stock, statut, poids, 
        type_conditionnement, seuil_alerte, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        code_article, nom_article, id_categorie, prix_achat || 0, 
        prix_vente, quantite_stock || 0, statut || 'actif', poids, 
        type_conditionnement || 'sac', seuil_alerte || 5, description
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("ERREUR SQL POST:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==================== ROUTES MAGASINS & CATÉGORIES ====================

app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY nom_categorie');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/magasins', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nom_magasin FROM magasins WHERE statut = "actif"');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==================== STATS ====================

app.get('/api/stats', async (req, res) => {
  try {
    const revenueQuery = `SELECT COALESCE(SUM(montant_total), 0) AS total_revenue, COUNT(*) AS total_sales FROM ventes`;
    const itemsSoldQuery = `SELECT COALESCE(SUM(quantite), 0) AS items_sold FROM vente_articles`;
    const pendingOrdersQuery = `SELECT COUNT(*) AS pending_orders FROM commandes WHERE statut <> 'livree'`;
    const profitQuery = `SELECT COALESCE(SUM((va.prix_unitaire - a.prix_achat) * va.quantite), 0) AS total_profit FROM vente_articles va JOIN articles a ON a.id = va.id_article`;

    const [revenue, items, pending, profit] = await Promise.all([
      pool.query(revenueQuery),
      pool.query(itemsSoldQuery),
      pool.query(pendingOrdersQuery),
      pool.query(profitQuery),
    ]);

    res.json({
      totalRevenue: Number(revenue.rows[0].total_revenue || 0),
      totalSales: Number(revenue.rows[0].total_sales || 0),
      totalItemsSold: Number(items.rows[0].items_sold || 0),
      totalProfit: Number(profit.rows[0].total_profit || 0),
      pendingOrders: Number(pending.rows[0].pending_orders || 0),
    });
  } catch (err) {
    console.error('❌ GET /api/stats error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ error: 'Erreur serveur interne', details: err.message });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// ==================== SERVER START ====================

app.listen(port, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  ✅ Backend CDCOM-FACI en cours d'exécution  ║
╚════════════════════════════════════════════╝
  
  🌍 URL du serveur: http://localhost:${port}
  📊 Health check:  http://localhost:${port}/api/health
  
  📝 Endpoints disponibles:
    POST   http://localhost:${port}/api/auth/register
    POST   http://localhost:${port}/api/auth/login
    GET    http://localhost:${port}/api/utilisateurs
    GET    http://localhost:${port}/api/articles
    GET    http://localhost:${port}/api/categories
  `);
});