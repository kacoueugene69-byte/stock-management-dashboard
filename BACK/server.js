// server.js - AUTHENTIFICATION

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Connexion PostgreSQL (Neon ou local via DATABASE_URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/// --- INSCRIPTION (REGISTER) ---
app.post('/api/auth/register', async (req, res) => {
  const nom = (req.body?.nom || '').trim();
  const prenom = (req.body?.prenom || '').trim();
  const email = (req.body?.email || '').trim().toLowerCase();
  const mot_de_passe = req.body?.mot_de_passe || '';
  const role = (req.body?.role || 'vendeur').trim().toLowerCase();
  const photo_url = req.body?.photo_url || null;

  if (!email || !mot_de_passe || !nom || !prenom) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires" });
  }
  if (mot_de_passe.length < 6) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1) personnel
    const insertPersonnel = `
      INSERT INTO personnel (nom, prenom, photo_url)
      VALUES ($1, $2, $3)
      RETURNING identifiant
    `;
    const pRes = await client.query(insertPersonnel, [nom, prenom, photo_url]);
    const personnelId = pRes.rows[0].identifiant;

    // 2) utilisateurs (sans nom_utilisateur)
    const insertUser = `
      INSERT INTO utilisateurs (email, mot_de_passe, id_personnel, role, statut)
      VALUES (LOWER($1), $2, $3, $4, 'actif')
      RETURNING identifiant, email, role, statut
    `;
    const uRes = await client.query(insertUser, [email, mot_de_passe, personnelId, role]);

    await client.query('COMMIT');
    return res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        ...uRes.rows[0],
        nom,
        prenom
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erreur Register:', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }
    return res.status(500).json({ error: "Erreur lors de la création du compte." });
  } finally {
    client.release();
  }


});
// --- CONNEXION (LOGIN) ---
app.post('/api/auth/login', async (req, res) => {
  const email = (req.body?.email || '').trim().toLowerCase();
  const mot_de_passe = req.body?.mot_de_passe || '';

  if (!email || !mot_de_passe) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  try {
    const q = `
      SELECT 
        u.identifiant,
        u.email,
        u.role,
        u.statut,
        u.id_personnel,
        p.nom,
        p.prenom
      FROM utilisateurs u
      LEFT JOIN personnel p ON p.identifiant = u.id_personnel
      WHERE LOWER(u.email) = LOWER($1)
        AND u.mot_de_passe = $2
      LIMIT 1
    `;
    const r = await pool.query(q, [email, mot_de_passe]);

    if (r.rows.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const user = r.rows[0];
    if (user.statut !== 'actif') {
      return res.status(403).json({ error: "Votre compte est inactif. Contactez l'administrateur." });
    }

    await pool.query(
      'UPDATE utilisateurs SET derniere_connexion = NOW() WHERE identifiant = $1',
      [user.identifiant]
    );

    return res.json({
      message: "Connexion réussie",
      user: {
        identifiant: user.identifiant,
        email: user.email,
        role: user.role,
        statut: user.statut,
        nom: user.nom,
        prenom: user.prenom
      }
    });
  } catch (err) {
    console.error('Erreur login:', err);
    return res.status(500).json({ error: "Erreur serveur lors de la connexion" });
  }
});

// --- MAGASINS ---
app.get('/api/magasins', async (_req, res) => {
  try {
    // Table: magasin (colonnes: identifiant, nom_magasin)
    const result = await pool.query(`
      SELECT identifiant AS id, nom_magasin 
      FROM magasin 
      ORDER BY nom_magasin
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur getMagasins:', err);
    res.status(500).json({ error: "Erreur lors de la récupération des magasins" });
  }
});

// --- CATEGORIES ---
app.get('/api/categories', async (_req, res) => {
  try {
    // Table: categories (colonnes: identifiant, nom_categorie)
    const result = await pool.query(`
      SELECT identifiant AS id, nom_categorie 
      FROM categories 
      ORDER BY nom_categorie
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur getCategories:', err);
    res.status(500).json({ error: "Erreur lors de la récupération des catégories" });
  }
});

// --- PERSONNEL (STAFF) ---
app.get('/api/staff', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT identifiant, nom, prenom, poste, telephone, id_magasin, statut, salaire_base, photo_url, email
      FROM personnel 
      ORDER BY nom, prenom
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur getStaff:', err);
    res.status(500).json({ error: "Erreur lors de la récupération du personnel" });
  }
});

app.post('/api/staff', async (req, res) => {
  const { nom, prenom, poste, telephone, id_magasin, statut, salaire_base, photo_url, email } = req.body;
  
  if (!nom || !prenom) {
    return res.status(400).json({ error: "Nom et prénom sont obligatoires" });
  }

  try {
    const result = await pool.query(`
      INSERT INTO personnel (nom, prenom, poste, telephone, id_magasin, statut, salaire_base, photo_url, email)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [nom, prenom, poste, telephone, id_magasin, statut || 'actif', salaire_base, photo_url, email]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur createStaff:', err);
    res.status(500).json({ error: "Erreur lors de la création du membre" });
  }
});

app.put('/api/staff/:id', async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, poste, telephone, id_magasin, statut, salaire_base, photo_url, email } = req.body;
  
  try {
    const result = await pool.query(`
      UPDATE personnel 
      SET nom = $1, prenom = $2, poste = $3, telephone = $4, id_magasin = $5, 
          statut = $6, salaire_base = $7, photo_url = $8, email = $9
      WHERE identifiant = $10
      RETURNING *
    `, [nom, prenom, poste, telephone, id_magasin, statut, salaire_base, photo_url, email, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Membre non trouvé" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur updateStaff:', err);
    res.status(500).json({ error: "Erreur lors de la modification du membre" });
  }
});

app.delete('/api/staff/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'DELETE FROM personnel WHERE identifiant = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Membre non trouvé" });
    }
    
    res.json({ message: "Membre supprimé avec succès" });
  } catch (err) {
    console.error('Erreur deleteStaff:', err);
    res.status(500).json({ error: "Erreur lors de la suppression du membre" });
  }
});

// Optionnel: healthcheck
app.get('/api/health', (_req, res) => res.json({ status: 'OK' }));

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});