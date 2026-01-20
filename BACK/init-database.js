require('dotenv').config();
const { Pool } = require('pg');

async function initDatabase() {
  console.log('🔧 Initialisation de la base de données Render...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false 
    }
  });

  try {
    // Création des tables selon le schéma SQL
    await pool.query(`
      -- Table des Magasins
      CREATE TABLE IF NOT EXISTS magasins (
          id SERIAL PRIMARY KEY,
          nom_magasin VARCHAR(100) NOT NULL,
          adresse TEXT,
          ville VARCHAR(50),
          telephone VARCHAR(20),
          email VARCHAR(100),
          directeur VARCHAR(100),
          statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      -- Table du Personnel
      CREATE TABLE IF NOT EXISTS personnels (
          id SERIAL PRIMARY KEY,
          matricule VARCHAR(20) UNIQUE NOT NULL,
          nom VARCHAR(50) NOT NULL,
          prenom VARCHAR(50) NOT NULL,
          poste VARCHAR(50),
          telephone VARCHAR(20),
          email VARCHAR(100),
          id_magasin INTEGER REFERENCES magasins(id) ON DELETE SET NULL,
          statut VARCHAR(20) DEFAULT 'actif',
          salaire_base DECIMAL(12, 2),
          photo_url TEXT,
          date_embauche DATE DEFAULT CURRENT_DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      -- Table des Utilisateurs
      CREATE TABLE IF NOT EXISTS utilisateurs (
          id SERIAL PRIMARY KEY,
          id_personnel INTEGER REFERENCES personnels(id) ON DELETE CASCADE,
          email VARCHAR(100) UNIQUE NOT NULL,
          mot_de_passe TEXT NOT NULL,
          role VARCHAR(30) NOT NULL CHECK (role IN ('superadmin', 'admin', 'gerant', 'vendeur')),
          statut VARCHAR(20) DEFAULT 'actif',
          derniere_connexion TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      -- Table des Catégories
      CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          nom_categorie VARCHAR(100) NOT NULL,
          description TEXT,
          date_creation DATE DEFAULT CURRENT_DATE
      );
    `);

    // Insertion des données par défaut
    await pool.query(`
      INSERT INTO magasins (nom_magasin, adresse, ville, telephone, email, directeur) VALUES 
      ('Magasin Principal', '123 Rue Principale', 'Abidjan', '+225 01 23 45 67 89', 'principal@stock.com', 'Directeur Principal')
      ON CONFLICT DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO categories (nom_categorie, description) VALUES 
      ('Électronique', 'Appareils électroniques'),
      ('Vêtements', 'Habits et textiles'),
      ('Alimentation', 'Produits alimentaires')
      ON CONFLICT DO NOTHING;
    `);

    // Création utilisateur admin par défaut
    const matricule = 'MAT' + Date.now();
    const personnelResult = await pool.query(`
      INSERT INTO personnels (matricule, nom, prenom, poste, email) 
      VALUES ($1, 'Admin', 'Systeme', 'Administrateur', 'admin@stock.com')
      RETURNING id
    `, [matricule]);

    const personnelId = personnelResult.rows[0].id;

    await pool.query(`
      INSERT INTO utilisateurs (id_personnel, email, mot_de_passe, role) 
      VALUES ($1, 'admin@stock.com', 'admin123', 'superadmin')
      ON CONFLICT (email) DO NOTHING
    `, [personnelId]);

    console.log('✅ Base de données initialisée avec succès!');
    console.log('📋 Tables créées: magasins, personnels, utilisateurs, categories');
    console.log('👤 Admin créé: admin@stock.com / admin123');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('🎉 Initialisation terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec:', error.message);
      process.exit(1);
    });
}

module.exports = { initDatabase };
