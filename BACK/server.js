require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Configuration CORS
app.use(cors());
app.use(express.json());

// Configuration de la connexion PostgreSQL (Neon nécessite SSL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  }
});

// Test de connexion à la base de données
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Erreur de connexion à la base de données:', err.stack);
  }
  console.log('✅ Connecté à PostgreSQL (Neon)');
  release();
});

// --- AUTHENTIFICATION : INSCRIPTION ---
app.post('/api/auth/register', async (req, res) => {
  const { nom, prenom, email, mot_de_passe, role, photo_url } = req.body;

  if (!email || !mot_de_passe || !nom || !prenom) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Création du profil personnel
    const pRes = await client.query(
      'INSERT INTO personnel (nom, prenom, photo_url) VALUES ($1, $2, $3) RETURNING identifiant',
      [nom.trim(), prenom.trim(), photo_url || null]
    );
    const personnelId = pRes.rows[0].identifiant;

    // 2. Création du compte utilisateur
    const uRes = await client.query(
      `INSERT INTO utilisateurs (email, mot_de_passe, id_personnel, role, statut) 
       VALUES (LOWER($1), $2, $3, $4, 'actif') 
       RETURNING identifiant, email, role`,
      [email.trim(), mot_de_passe, personnelId, role || 'vendeur']
    );

    await client.query('COMMIT');
    res.status(201).json({ message: "Utilisateur créé", user: uRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erreur Register:', err);
    res.status(500).json({ error: err.code === '23505' ? "Email déjà utilisé" : "Erreur serveur" });
  } finally {
    client.release();
  }
});

// --- AUTHENTIFICATION : CONNEXION ---
app.post('/api/auth/login', async (req, res) => {
  const { email, mot_de_passe } = req.body;
  if (!email || !mot_de_passe) return res.status(400).json({ error: "Champs requis" });

  try {
    const q = `
      SELECT u.identifiant, u.email, u.mot_de_passe, u.role, u.statut, p.nom, p.prenom 
      FROM utilisateurs u 
      JOIN personnel p ON p.identifiant = u.id_personnel 
      WHERE LOWER(u.email) = LOWER($1) AND u.mot_de_passe = $2
    `;
    const r = await pool.query(q, [email.trim(), mot_de_passe]);

    if (r.rows.length === 0) return res.status(401).json({ error: "Identifiants incorrects" });

    const user = r.rows[0];
    if (user.statut !== 'actif') return res.status(403).json({ error: "Compte inactif" });

    await pool.query('UPDATE utilisateurs SET derniere_connexion = NOW() WHERE identifiant = $1', [user.identifiant]);
    
    delete user.mot_de_passe; // Sécurité
    res.json({ message: "Connexion réussie", user });
  } catch (err) {
    console.error('Erreur Login:', err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// --- GESTION DU PERSONNEL & MAGASINS ---
app.get('/api/staff', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM personnel ORDER BY nom ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "Erreur chargement personnel" }); }
});

app.get('/api/magasins', async (req, res) => {
  try {
    const result = await pool.query('SELECT identifiant as id, nom_magasin FROM magasin ORDER BY nom_magasin');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "Erreur chargement magasins" }); }
});

// --- DÉMARRAGE DU SERVEUR ---
// IMPORTANT : On récupère le port de Render, ou 5000 par défaut en local
const PORT = process.env.PORT || 5000;

// IMPORTANT : L'hôte '0.0.0.0' est nécessaire pour que Render accepte les connexions entrantes
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`✅ Base de données connectée`);
});