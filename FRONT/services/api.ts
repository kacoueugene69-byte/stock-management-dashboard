// services/api.ts

export type UserRole = 'superadmin' | 'admin' | 'gerant' | 'vendeur';

export type RegisterPayload = {
  email: string;
  mot_de_passe: string;
  role?: UserRole; // optionnel, par défaut 'vendeur' côté backend
};

// Personnel: garde nom/prenom ici car ta table 'personnels' les contient.
// (Ce n'est pas la table 'utilisateurs'.)
export type StaffMember = {
  id: number;
  id_magasin: number | null;
  MagasinId?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  poste: string;
  statut: 'actif' | 'inactif';
  matricule: string;
  salaire_base: number;
  date_embauche: string;
  photo_url?: string;
  magasin_nom?: string;
};

export type DashboardStats = {
  totalSalesCount: number;
  totalRevenue: number;
  totalOrdersCount: number;
};

export type ArticleMovements = {
  in: number;
  out: number;
};

const API_URL = (import.meta as any).env?.VITE_API_URL?.trim() || 'https://gstock-backend.onrender.com';

// Debug pour vérifier l'URL utilisée
console.log('🔗 API_URL utilisée:', API_URL);

export const ApiService = {
  login: async (payload: { email: string; mot_de_passe: string }) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error || 'Erreur serveur');
    }

    return await response.json();
  },

  register: async (payload: { email: string; mot_de_passe: string }) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error || 'Erreur serveur');
    }

    return await response.json();
  },

  // --- UTILISATEURS ---
  getUsers: async () => {
    const response = await fetch(`${API_URL}/api/users`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error || 'Erreur lors du chargement des utilisateurs');
    }

    return await response.json();
  },

  createUser: async (userData: { email: string; mot_de_passe: string; role?: string; statut?: string }) => {
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error || 'Erreur lors de la création de l\'utilisateur');
    }

    return await response.json();
  },

  updateUser: async (id: number, userData: { email?: string; mot_de_passe?: string; role?: string; statut?: string }) => {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error || 'Erreur lors de la modification de l\'utilisateur');
    }

    return await response.json();
  },

  deleteUser: async (id: number) => {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error || 'Erreur lors de la suppression de l\'utilisateur');
    }

    return await response.json();
  },

  getStats: async () => {
    const response = await fetch(`${API_URL}/api/stats`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error || 'Erreur lors du chargement des statistiques');
    }

    return await response.json();
  },

  getArticleMovements: async () => {
    const response = await fetch(`${API_URL}/api/article-movements`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error || 'Erreur lors du chargement des mouvements d\'articles');
    }

    return await response.json();
  }
};

export default ApiService;
