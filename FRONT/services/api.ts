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

const API_URL: string =
  (import.meta as any).env?.VITE_API_URL?.trim() || 'https://gstock-backend.onrender.com';

// Utilitaire pour récupérer un token si présent
const getToken = () =>
  localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

const jsonHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const apiClient = {
  // --- AUTH ---
  register: async (userData: RegisterPayload) => {
    const payload = {
      email: userData.email.trim().toLowerCase(),
      mot_de_passe: userData.mot_de_passe.trim(),
      ...(userData.role ? { role: userData.role } : {})
    };

    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload)
    });

    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new Error("Réponse invalide du serveur");
    }

    if (!response.ok) {
      throw new Error(data?.error || "Erreur lors de l'inscription");
    }
    return data; // { message, user }
  },

  login: async (credentials: { email: string; mot_de_passe: string }) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({
        email: credentials.email?.trim().toLowerCase(),
        mot_de_passe: credentials.mot_de_passe?.trim()
      })
    });

    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new Error('Réponse invalide du serveur');
    }

    if (!response.ok) {
      throw new Error(data?.error || data?.message || 'Identifiants incorrects');
    }

    return data; // { message, user, token? }
  },

  // --- SUPERADMINS (si tu gardes ces endpoints) ---
  createSuperadmin: async (payload: RegisterPayload & { secret: string }) => {
    const response = await fetch(`${API_URL}/api/auth/create-superadmin`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
        mot_de_passe: payload.mot_de_passe.trim(),
        role: payload.role || 'superadmin',
        secret: payload.secret
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Erreur lors de la création du superadmin');
    return data;
  },

  deleteSuperadmin: async (id: number) => {
    const response = await fetch(`${API_URL}/api/auth/delete-superadmin/${id}`, {
      method: 'DELETE',
      headers: jsonHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Erreur lors de la suppression du superadmin');
    return data;
  },

  getSuperadmins: async () => {
    const response = await fetch(`${API_URL}/api/auth/superadmins`, {
      headers: jsonHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Erreur chargement superadmins');
    return data;
  },

  // --- PERSONNELS ---
  getStaff: async (): Promise<StaffMember[]> => {
    const response = await fetch(`${API_URL}/api/staff`, { headers: jsonHeaders() });
    if (!response.ok) throw new Error('Erreur lors du chargement du personnel');
    return await response.json();
  },

  createStaff: async (staffData: Partial<StaffMember>) => {
    const response = await fetch(`${API_URL}/api/staff`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(staffData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Erreur lors de la création');
    return data;
  },

  updateStaff: async (id: number, staffData: Partial<StaffMember>) => {
    const response = await fetch(`${API_URL}/api/staff/${id}`, {
      method: 'PUT',
      headers: jsonHeaders(),
      body: JSON.stringify(staffData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Erreur lors de la modification');
    return data;
  },

  deleteStaff: async (id: number) => {
    const response = await fetch(`${API_URL}/api/staff/${id}`, {
      method: 'DELETE',
      headers: jsonHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Erreur lors de la suppression');
    return data;
  },

  // --- UTILISATEURS ---
  createUser: async (userData: { email: string; mot_de_passe: string; role?: UserRole; statut?: 'actif' | 'inactif' }) => {
    const payload = {
      email: userData.email.trim().toLowerCase(),
      mot_de_passe: userData.mot_de_passe.trim(),
      ...(userData.role ? { role: userData.role } : {}),
      ...(userData.statut ? { statut: userData.statut } : {})
    };

    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Erreur lors de la création');
    return data;
  },

  getUsers: async (filters?: { role?: UserRole }) => {
    const params = filters?.role ? `?role=${encodeURIComponent(filters.role)}` : '';
    const response = await fetch(`${API_URL}/api/users${params}`, { headers: jsonHeaders() });
    if (!response.ok) throw new Error('Erreur lors du chargement des utilisateurs');
    return await response.json();
  },

  updateUser: async (id: number, userData: Partial<{ email: string; mot_de_passe: string; role: UserRole; statut: 'actif' | 'inactif' }>) => {
    const payload = {
      ...(userData.email ? { email: userData.email.trim().toLowerCase() } : {}),
      ...(userData.mot_de_passe ? { mot_de_passe: userData.mot_de_passe.trim() } : {}),
      ...(userData.role ? { role: userData.role } : {}),
      ...(userData.statut ? { statut: userData.statut } : {})
    };

    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: jsonHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Erreur lors de la modification');
    return data;
  },

  deleteUser: async (id: number) => {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: jsonHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Erreur lors de la suppression');
    return data;
  },

  // --- MAGASINS ---
  getMagasins: async () => {
    const response = await fetch(`${API_URL}/api/magasins`, { headers: jsonHeaders() });
    if (!response.ok) throw new Error('Erreur lors du chargement des magasins');
    return await response.json();
  },

  // --- DASHBOARD ---
  getStats: async (): Promise<DashboardStats> => {
    const response = await fetch(`${API_URL}/api/stats`, { headers: jsonHeaders() });
    if (!response.ok) throw new Error('Erreur lors du chargement des statistiques');
    return await response.json();
  },

  getArticleMovements: async (): Promise<ArticleMovements> => {
    const response = await fetch(`${API_URL}/api/article-movements`, { headers: jsonHeaders() });
    if (!response.ok) throw new Error("Erreur lors du chargement des mouvements d'articles");
    return await response.json();
  }
};

export const ApiService = apiClient;
export default apiClient;
