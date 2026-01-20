require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Configuration CORS
app.use(cors({
  origin: '*', // En production, remplacez par votre domaine frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Configuration PostgreSQL avec Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  }
});

// Test de connexion à la base de données
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
    console.error('📋 Vérifiez votre DATABASE_URL dans le fichier .env');
    console.error('🔗 URL actuelle:', process.env.DATABASE_URL ? 'Définie' : 'NON DÉFINIE');
    return;
  }
  console.log('✅ Connecté à PostgreSQL (Neon)');
  release();
});

// ============================================
// ROUTES D'AUTHENTIFICATION
// ============================================

// --- INSCRIPTION ---
app.post('/api/auth/register', async (req, res) => {
  const { nom, prenom, email, mot_de_passe, role, photo_url } = req.body;

  if (!email || !mot_de_passe || !nom || !prenom) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Générer un matricule unique
    const matricule = 'MAT' + Date.now();

    // 1. Création du profil personnel
    const pRes = await client.query(
      'INSERT INTO personnels (nom, prenom, photo_url, matricule) VALUES ($1, $2, $3, $4) RETURNING id',
      [nom.trim(), prenom.trim(), photo_url || null, matricule]
    );
    const personnelId = pRes.rows[0].id;

    // 2. Création du compte utilisateur
    const uRes = await client.query(
      `INSERT INTO utilisateurs (email, mot_de_passe, id_personnel, role, statut) 
       VALUES (LOWER($1), $2, $3, $4, 'actif') 
       RETURNING id, email, role`,
      [email.trim(), mot_de_passe, personnelId, role || 'vendeur']
    );

    await client.query('COMMIT');
    
    res.status(201).json({ 
      message: "Utilisateur créé avec succès", 
      user: {
        ...uRes.rows[0],
        nom,
        prenom
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur Register:', err);
    
    if (err.code === '23505') {
      res.status(409).json({ error: "Email déjà utilisé" });
    } else {
      res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
    }
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
      SELECT 
        u.id, 
        u.email, 
        u.role, 
        u.statut, 
        p.nom, 
        p.prenom 
      FROM utilisateurs u 
      LEFT JOIN personnels p ON p.id = u.id_personnel 
      WHERE LOWER(u.email) = LOWER($1) AND u.mot_de_passe = $2
    `;
    
    const result = await pool.query(query, [email.trim(), mot_de_passe]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const user = result.rows[0];
    
    if (user.statut !== 'actif') {
      return res.status(403).json({ error: "Compte inactif" });
    }

    // Mettre à jour la dernière connexion
    await pool.query(
      'UPDATE utilisateurs SET derniere_connexion = NOW() WHERE id = $1',
      [user.id]
    );

    console.log('✅ Connexion réussie:', user.email);
    
    res.json({ 
      message: "Connexion réussie", 
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nom: user.nom,
        prenom: user.prenom
      }
    });
  } catch (err) {
    console.error('❌ Erreur Login:', err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ============================================
// ROUTES PERSONNEL
// ============================================

// GET tous les membres du personnel
app.get('/api/staff', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id as identifiant,
        matricule,
        nom,
        prenom,
        poste,
        telephone,
        email,
        id_magasin,
        statut,
        salaire_base,
        photo_url,
        date_embauche,
        created_at
      FROM personnels 
      ORDER BY nom ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Erreur GET staff:', err);
    res.status(500).json({ error: "Erreur chargement personnel" });
  }
});

// POST créer un membre du personnel
app.post('/api/staff', async (req, res) => {
  const { nom, prenom, poste, telephone, email, id_magasin, salaire_base, photo_url, statut } = req.body;

  if (!nom || !prenom) {
    return res.status(400).json({ error: "Nom et prénom requis" });
  }

  try {
    const matricule = 'MAT' + Date.now();
    
    const query = `
      INSERT INTO personnels (
        matricule, nom, prenom, poste, telephone, email, 
        id_magasin, salaire_base, photo_url, statut
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      matricule,
      nom.trim(),
      prenom.trim(),
      poste || 'vendeur',
      telephone || null,
      email || null,
      id_magasin || null,
      salaire_base || null,
      photo_url || null,
      statut || 'actif'
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Erreur POST staff:', err);
    res.status(500).json({ error: "Erreur lors de la création du membre" });
  }
});

// PUT mettre à jour un membre du personnel
app.put('/api/staff/:id', async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, poste, telephone, email, id_magasin, salaire_base, photo_url, statut } = req.body;

  try {
    const query = `
      UPDATE personnels SET
        nom = $1,
        prenom = $2,
        poste = $3,
        telephone = $4,
        email = $5,
        id_magasin = $6,
        salaire_base = $7,
        photo_url = $8,
        statut = $9
      WHERE id = $10
      RETURNING *
    `;
    
    const values = [
      nom,
      prenom,
      poste,
      telephone,
      email,
      id_magasin,
      salaire_base,
      photo_url,
      statut,
      id
    ];

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Erreur PUT staff:', err);
    res.status(500).json({ error: "Erreur lors de la modification" });
  }
});

// DELETE supprimer un membre du personnel
app.delete('/api/staff/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM personnels WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }
    
    res.json({ message: 'Membre supprimé avec succès' });
  } catch (err) {
    console.error('❌ Erreur DELETE staff:', err);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// ============================================
// ROUTES MAGASINS
// ============================================

app.get('/api/magasins', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nom_magasin FROM magasins ORDER BY nom_magasin');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Erreur GET magasins:', err);
    res.status(500).json({ error: "Erreur chargement magasins" });
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
    console.error('❌ Erreur GET categories:', err);
    res.status(500).json({ error: "Erreur chargement catégories" });
  }
});

// ============================================
// ROUTE DE TEST
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API GStock fonctionnelle',
    timestamp: new Date().toISOString()
  });
});

// Route par défaut
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API GStock' });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`✅ Base de données connectée`);
});

module.exports = app;