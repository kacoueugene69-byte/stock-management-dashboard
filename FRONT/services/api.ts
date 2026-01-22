// services/api.ts
export type RegisterPayload = {
  email: string;
  mot_de_passe: string;
  role?: 'superadmin' | 'admin' | 'gerant' | 'vendeur';
};

export type StaffMember = {
  id: number;
  id_magasin: number;
  MagasinId?: number; // si utilisé par Sequelize
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  poste: string;
  statut: string;
  matricule: string;
  salaire_base: number;
  date_embauche: string; // ou Date si tu veux le parser
  photo_url?: string;
  magasin_nom?: string; // si jointure avec table magasins
};

// Types pour le dashboard
export type DashboardStats = {
  totalSalesCount: number;
  totalRevenue: number;
  totalOrdersCount: number;
};

export type ArticleMovements = {
  in: number;
  out: number;
};

const API_URL: string = (import.meta as any).env.VITE_API_URL ?? 'https://gstock-backend.onrender.com';

const apiClient = {
  register: async (userData: RegisterPayload) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Erreur lors de l'inscription");
    return data;
  },

  login: async (credentials: { email: string; mot_de_passe: string }) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Identifiants incorrects');
    return data;
  },

  getUsers: async (filters?: { role?: string }) => {
    const params = filters?.role ? `?role=${encodeURIComponent(filters.role)}` : '';
    const response = await fetch(`${API_URL}/api/users${params}`);
    if (!response.ok) throw new Error('Erreur lors du chargement des utilisateurs');
    return await response.json();
  },

  createSuperadmin: async (payload: RegisterPayload & { secret: string }) => {
    const response = await fetch(`${API_URL}/api/auth/create-superadmin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur lors de la création du superadmin');
    return data;
  },

  deleteSuperadmin: async (id: number) => {
    const response = await fetch(`${API_URL}/api/auth/delete-superadmin/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur lors de la suppression du superadmin');
    return data;
  },

  deleteSuperadminFromUsers: async (id: number) => {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur lors de la suppression du superadmin');
    return data;
  },

  getSuperadmins: async () => {
    const response = await fetch(`${API_URL}/api/auth/superadmins`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur chargement superadmins');
    return data;
  },

  getStaff: async () => {
    const response = await fetch(`${API_URL}/api/staff`);
    if (!response.ok) throw new Error('Erreur lors du chargement du personnel');
    return await response.json();
  },

  createStaff: async (staffData: any) => {
    const response = await fetch(`${API_URL}/api/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staffData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur lors de la création');
    return data;
  },

  updateStaff: async (id: number, staffData: any) => {
    const response = await fetch(`${API_URL}/api/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staffData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur lors de la modification');
    return data;
  },

  deleteStaff: async (id: number) => {
    const response = await fetch(`${API_URL}/api/staff/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur lors de la suppression');
    return data;
  },

  createUser: async (userData: any) => {
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur lors de la création');
    return data;
  },

  updateUser: async (id: number, userData: any) => {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur lors de la modification');
    return data;
  },

  deleteUser: async (id: number) => {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur lors de la suppression');
    return data;
  },

  getMagasins: async () => {
    const response = await fetch(`${API_URL}/api/magasins`);
    if (!response.ok) throw new Error('Erreur lors du chargement des magasins');
    return await response.json();
  },

  // --- NOUVELLES MÉTHODES POUR LE DASHBOARD ---
  getStats: async (): Promise<DashboardStats> => {
    const response = await fetch(`${API_URL}/api/stats`);
    if (!response.ok) {
      // si l'endpoint n'existe pas côté backend, on renvoie un fallback
      throw new Error('Erreur lors du chargement des statistiques');
    }
    return await response.json();
  },

  getArticleMovements: async (): Promise<ArticleMovements> => {
    const response = await fetch(`${API_URL}/api/article-movements`);
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des mouvements d\'articles');
    }
    return await response.json();
  },
};

export const ApiService = apiClient;
export default apiClient;
