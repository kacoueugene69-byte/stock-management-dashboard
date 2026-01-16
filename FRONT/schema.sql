-- Création de la base de données
--CREATE DATABASE gstock_db;

-- 1. Table des Magasins
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

-- 2. Table du Personnel
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

-- 3. Table des Utilisateurs (Comptes de connexion)
CREATE TABLE IF NOT EXISTS utilisateurs (
    id SERIAL PRIMARY KEY,
    id_personnel INTEGER REFERENCES personnels(id) ON DELETE CASCADE,
    nom_utilisateur VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mot_de_passe TEXT NOT NULL, -- Hashé en production
    role VARCHAR(30) NOT NULL CHECK (role IN ('superadmin', 'admin', 'gerant', 'vendeur')),
    statut VARCHAR(20) DEFAULT 'actif',
    derniere_connexion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table des Catégories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    nom_categorie VARCHAR(100) NOT NULL,
    description TEXT,
    date_creation DATE DEFAULT CURRENT_DATE
);

-- 5. Table des Articles (Produits)
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    code_article VARCHAR(50) UNIQUE NOT NULL,
    nom_article VARCHAR(150) NOT NULL,
    id_categorie INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    prix_achat DECIMAL(12, 2) DEFAULT 0,
    prix_vente DECIMAL(12, 2) NOT NULL,
    quantite_stock INTEGER DEFAULT 0,
    statut VARCHAR(20) DEFAULT 'actif',
    poids VARCHAR(20),
    type_conditionnement VARCHAR(50), -- sac, carton, unité, etc.
    seuil_alerte INTEGER DEFAULT 5,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Table des Clients
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    code_client VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50),
    telephone VARCHAR(20),
    email VARCHAR(100),
    adresse TEXT,
    ville VARCHAR(50),
    points_fidelite INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table des Ventes
CREATE TABLE IF NOT EXISTS ventes (
    id SERIAL PRIMARY KEY,
    date_vente TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    id_magasin INTEGER REFERENCES magasins(id),
    id_client INTEGER REFERENCES clients(id),
    nom_client_libre VARCHAR(100), -- Pour les clients non enregistrés
    montant_total DECIMAL(15, 2) NOT NULL,
    montant_paye DECIMAL(15, 2) DEFAULT 0,
    mode_paiement VARCHAR(30) DEFAULT 'espèces',
    statut_paiement VARCHAR(20) CHECK (statut_paiement IN ('payé', 'partiel', 'impayé')),
    nom_vendeur VARCHAR(100),
    id_utilisateur INTEGER REFERENCES utilisateurs(id)
);

-- 8. Table de détails des Ventes (Articles vendus)
CREATE TABLE IF NOT EXISTS vente_articles (
    id SERIAL PRIMARY KEY,
    id_vente INTEGER REFERENCES ventes(id) ON DELETE CASCADE,
    id_article INTEGER REFERENCES articles(id),
    quantite INTEGER NOT NULL,
    prix_unitaire DECIMAL(12, 2) NOT NULL,
    total_ligne DECIMAL(15, 2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED
);

-- 9. Table des Commandes
CREATE TABLE IF NOT EXISTS commandes (
    id SERIAL PRIMARY KEY,
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    id_client INTEGER REFERENCES clients(id),
    date_commande DATE DEFAULT CURRENT_DATE,
    statut VARCHAR(30) DEFAULT 'en attente' CHECK (statut IN ('en attente', 'preparation', 'livree', 'annulee')),
    montant_total DECIMAL(15, 2) NOT NULL,
    montant_paye DECIMAL(15, 2) DEFAULT 0,
    statut_paiement VARCHAR(20) DEFAULT 'impayé'
);

-- 10. Table des Factures
CREATE TABLE IF NOT EXISTS factures (
    id SERIAL PRIMARY KEY,
    numero_facture VARCHAR(50) UNIQUE NOT NULL,
    id_vente INTEGER UNIQUE REFERENCES ventes(id) ON DELETE CASCADE,
    date_facture TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Table des Mouvements de Stock
CREATE TABLE IF NOT EXISTS mouvements_stock (
    id SERIAL PRIMARY KEY,
    date_mouvement TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    id_article INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    id_magasin INTEGER REFERENCES magasins(id) ON DELETE CASCADE,
    type_mouvement VARCHAR(10) CHECK (type_mouvement IN ('entrée', 'sortie')),
    quantite INTEGER NOT NULL,
    raison TEXT,
    id_utilisateur INTEGER REFERENCES utilisateurs(id)
);

-- Index pour optimiser les recherches
CREATE INDEX idx_articles_code ON articles(code_article);
CREATE INDEX idx_ventes_date ON ventes(date_vente);
CREATE INDEX idx_stock_article ON mouvements_stock(id_article);
