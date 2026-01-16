const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { pool } = require('./db');

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

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

// ==================== AUTHENTIFICATION ====================

app.post('/api/auth/login', async (req, res) => {
  const { nom_utilisateur, mot_de_passe } = req.body;

  if (!nom_utilisateur || !mot_de_passe) {
    return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.nom_utilisateur, u.email, u.role, u.statut, p.nom, p.prenom 
       FROM utilisateurs u 
       LEFT JOIN personnels p ON u.id_personnel = p.id 
       WHERE u.nom_utilisateur = $1 AND u.mot_de_passe = $2 AND u.statut = 'actif'`,
      [nom_utilisateur, mot_de_passe]
    );

    if (!rows[0]) {
      return res.status(401).json({ error: 'Identifiants incorrects ou compte inactif' });
    }

    const user = rows[0];
    res.json({
      id: user.id,
      nom_utilisateur: user.nom_utilisateur,
      email: user.email,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom,
      statut: user.statut
    });
  } catch (err) {
    console.error('❌ POST /api/auth/login error:', err);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { nom_utilisateur, email, mot_de_passe, nom, prenom } = req.body;

  console.log('📝 Données reçues:', { nom_utilisateur, email, mot_de_passe, nom, prenom });

  if (!nom_utilisateur || !email || !mot_de_passe) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
  }

  const client = await pool.connect();
  try {
    // Vérifier si l'utilisateur existe déjà
    console.log('🔍 Vérification si utilisateur existe...');
    const existCheck = await client.query(
      'SELECT id FROM utilisateurs WHERE nom_utilisateur = $1 OR email = $2',
      [nom_utilisateur, email]
    );

    if (existCheck.rows.length > 0) {
      console.log('⚠️ Utilisateur déjà existant');
      client.release();
      return res.status(409).json({ error: 'Cet utilisateur ou email existe déjà' });
    }

    // Démarrer une transaction
    await client.query('BEGIN');

    let id_personnel = null;

    // Si le nom et prénom sont fournis, créer un enregistrement dans personnels
    if (nom && prenom) {
      console.log('👤 Création du personnel...');
      const personnelResult = await client.query(
        `INSERT INTO personnels (matricule, nom, prenom, email, statut) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id`,
        [
          `USER_${Date.now()}`,
          nom,
          prenom,
          email,
          'actif'
        ]
      );
      id_personnel = personnelResult.rows[0].id;
      console.log('✅ Personnel créé avec ID:', id_personnel);
    }

    // Créer le nouvel utilisateur
    console.log('➕ Insertion du nouvel utilisateur...');
    const userResult = await client.query(
      `INSERT INTO utilisateurs (id_personnel, nom_utilisateur, email, mot_de_passe, role, statut) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, id_personnel, nom_utilisateur, email, role, statut`,
      [id_personnel, nom_utilisateur, email, mot_de_passe, 'vendeur', 'actif']
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      console.error('❌ Aucune ligne retournée après INSERT');
      return res.status(500).json({ error: 'Erreur lors de l\'insertion' });
    }

    // Valider la transaction
    await client.query('COMMIT');

    const user = userResult.rows[0];
    console.log('✅ Utilisateur créé avec succès:', user);
    res.status(201).json({
      message: 'Inscription réussie',
      user: {
        id: user.id,
        nom_utilisateur: user.nom_utilisateur,
        email: user.email,
        role: user.role,
        statut: user.statut
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ POST /api/auth/register error:', err.message);
    console.error('Code erreur:', err.code);
    console.error('Détail:', err.detail);
    
    res.status(500).json({ 
      error: 'Erreur lors de l\'inscription',
      details: err.message 
    });
  } finally {
    client.release();
  }
});

// ==================== UTILISATEURS ====================

app.get('/api/utilisateurs', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.id_personnel, u.nom_utilisateur, u.email, u.role, u.statut, u.derniere_connexion, p.nom, p.prenom 
       FROM utilisateurs u 
       LEFT JOIN personnels p ON u.id_personnel = p.id 
       ORDER BY u.id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ GET /api/utilisateurs error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

app.post('/api/utilisateurs', async (req, res) => {
  const { id_personnel, nom_utilisateur, email, mot_de_passe, role, statut } = req.body;

  if (!nom_utilisateur || !email || !mot_de_passe || !role) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO utilisateurs (id_personnel, nom_utilisateur, email, mot_de_passe, role, statut) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, nom_utilisateur, email, role, statut`,
      [id_personnel || null, nom_utilisateur, email, mot_de_passe, role, statut || 'actif']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('❌ POST /api/utilisateurs error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Cet utilisateur ou email existe déjà' });
    }
    res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'utilisateur' });
  }
});

app.put('/api/utilisateurs/:id', async (req, res) => {
  const { id } = req.params;
  const { email, mot_de_passe, role, statut } = req.body;
  const updates = [];
  const values = [];

  if (email) {
    updates.push(`email = $${updates.length + 1}`);
    values.push(email);
  }
  if (mot_de_passe) {
    updates.push(`mot_de_passe = $${updates.length + 1}`);
    values.push(mot_de_passe);
  }
  if (role) {
    updates.push(`role = $${updates.length + 1}`);
    values.push(role);
  }
  if (statut) {
    updates.push(`statut = $${updates.length + 1}`);
    values.push(statut);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
  }

  values.push(id);

  try {
    const { rows } = await pool.query(
      `UPDATE utilisateurs SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    if (!rows[0]) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ PUT /api/utilisateurs/:id error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

app.delete('/api/utilisateurs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('DELETE FROM utilisateurs WHERE id = $1 RETURNING id', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json({ message: 'Utilisateur supprimé', id });
  } catch (err) {
    console.error('❌ DELETE /api/utilisateurs/:id error:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ==================== ARTICLES ====================

app.get('/api/articles', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM articles ORDER BY created_at DESC, id DESC');
    res.json(rows);
  } catch (err) {
    console.error('❌ GET /api/articles error:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des articles' });
  }
});

app.get('/api/articles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ message: 'Article introuvable' });
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ GET /api/articles/:id error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'article' });
  }
});

app.post('/api/articles', async (req, res) => {
  const {
    code_article, nom_article, id_categorie, prix_achat, prix_vente,
    quantite_stock, statut, poids, type_conditionnement, seuil_alerte, description,
  } = req.body || {};

  if (!code_article || !nom_article || !prix_vente) {
    return res.status(400).json({ error: 'code_article, nom_article et prix_vente sont obligatoires' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO articles (code_article, nom_article, id_categorie, prix_achat, prix_vente, quantite_stock, statut, poids, type_conditionnement, seuil_alerte, description) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [code_article, nom_article, id_categorie ?? null, prix_achat ?? 0, prix_vente, quantite_stock ?? 0, statut ?? 'actif', poids ?? null, type_conditionnement ?? null, seuil_alerte ?? 5, description ?? null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('❌ POST /api/articles error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'article' });
  }
});

app.put('/api/articles/:id', async (req, res) => {
  const { id } = req.params;
  const fields = ['code_article','nom_article','id_categorie','prix_achat','prix_vente','quantite_stock','statut','poids','type_conditionnement','seuil_alerte','description'];
  const values = [];
  const sets = [];
  
  fields.forEach((f) => {
    if (f in req.body) {
      values.push(req.body[f]);
      sets.push(`${f} = $${values.length}`);
    }
  });
  
  if (values.length === 0) return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
  values.push(id);

  try {
    const { rows } = await pool.query(
      `UPDATE articles SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    if (!rows[0]) return res.status(404).json({ error: 'Article introuvable' });
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ PUT /api/articles/:id error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

app.delete('/api/articles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('DELETE FROM articles WHERE id = $1 RETURNING id', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Article introuvable' });
    res.json({ message: 'Article supprimé', id });
  } catch (err) {
    console.error('❌ DELETE /api/articles/:id error:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ==================== CATEGORIES ====================

app.get('/api/categories', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('❌ GET /api/categories error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
  }
});

app.post('/api/categories', async (req, res) => {
  const { nom_categorie, description } = req.body;
  if (!nom_categorie) {
    return res.status(400).json({ error: 'Le nom de la catégorie est obligatoire' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO categories (nom_categorie, description) VALUES ($1, $2) RETURNING *',
      [nom_categorie, description ?? null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('❌ POST /api/categories error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la catégorie' });
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