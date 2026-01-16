
export type UserRole = 'superadmin' | 'admin' | 'gerant' | 'vendeur';
export type PaymentStatus = 'payé' | 'partiel' | 'impayé';
export type OrderStatus = 'en attente' | 'preparation' | 'livree' | 'annulee';
export type StockMovementType = 'entrée' | 'sortie';

export interface Magasin {
    id: number;
    nom_magasin: string;
    adresse: string;
    ville: string;
    telephone: string;
    email: string;
    directeur: string;
    statut: 'actif' | 'inactif';
}

export interface Categorie {
    id: number;
    nom_categorie: string;
    description: string;
    date_creation: string;
}

export interface Article {
    id: number;
    code_article: string;
    nom_article: string;
    id_categorie: number | null;
    prix_achat: number;
    prix_vente: number;
    quantite_stock: number;
    statut: string;
    poids: string;
    type_conditionnement: string;
    seuil_alerte: number;
    description: string;
}

export interface Client {
    id: number;
    code_client: string;
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    adresse: string;
    ville: string;
    points_fidelite: number;
}

export interface Personnel {
    id: number;
    matricule: string;
    nom: string;
    prenom: string;
    poste: string;
    telephone: string;
    email: string;
    id_magasin: number | null;
    statut: string;
    salaire_base: number;
    photo_url: string;
    date_embauche: string;
}

export interface Utilisateur {
    id: number;
    id_personnel: number | null;
    nom_utilisateur: string;
    email: string;
    role: UserRole;
    statut: string;
    derniere_connexion: string | null;
}

export interface Vente {
    id: number;
    date_vente: string;
    id_magasin: number;
    id_client: number | null;
    nom_client_libre: string;
    montant_total: number;
    montant_paye: number;
    mode_paiement: string;
    statut_paiement: PaymentStatus;
    nom_vendeur: string;
}

export interface VenteArticle {
    id: number;
    id_vente: number;
    id_article: number;
    quantite: number;
    prix_unitaire: number;
    nom_article?: string; // Jointure utile pour le front
}
