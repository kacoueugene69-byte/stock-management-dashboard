// services/api.ts

export type UserRole = 'superadmin' | 'admin' | 'gerant' | 'vendeur';
export type UserStatut = 'actif' | 'inactif';

export type RegisterPayload = {
  email: string;
  mot_de_passe: string;
  role?: UserRole;   // optional, defaults to 'vendeur' backend-side
  statut?: UserStatut; // optional, defaults to 'actif' backend-side
};

export type StaffMember = {
  id: number;
  id_magasin: number | null;
  MagasinId?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  poste: string;
  statut: UserStatut;
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

// ✅ Fix the typo and prefer env; fallback must match your deployed backend exactly
const RAW_API_URL = (import.meta as any).env?.VITE_API_URL;
const API_URL = (RAW_API_URL && RAW_API_URL.trim().replace(/\/+$/, '')) || 'https://gstock-backend.onrender.com';

console.log('🔗 API_URL utilisée:', API_URL);

// Centralized error handling that tolerates non-JSON bodies
async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    // Non-JSON error body
    throw new Error(response.ok ? 'Réponse invalide du serveur' : 'Erreur serveur');
  }
}

// Persist token and attach automatically
let authToken: string | null = null;
export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('gstock_token', token);
  } else {
    localStorage.removeItem('gstock_token');
  }
}
export function loadAuthTokenFromStorage() {
  const t = localStorage.getItem('gstock_token');
  authToken = t;
  return t;
}

function authHeaders() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  return headers;
}

export const ApiService = {
  async login(payload: { email: string; mot_de_passe: string }) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
        mot_de_passe: payload.mot_de_passe.trim()
      })
    });

    const data = await parseResponse<{ token: string; user: any; message?: string }>(response);
    if (!response.ok) {
      throw new Error((data as any)?.error || 'Erreur serveur');
    }

    setAuthToken(data.token);
    return data;
  },

  async register(payload: RegisterPayload) {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
        mot_de_passe: payload.mot_de_passe.trim(),
        role: payload.role,
        statut: payload.statut
      })
    });

    const data = await parseResponse(response);
    if (!response.ok) {
      throw new Error((data as any)?.error || 'Erreur serveur');
    }
    return data;
  },

  // --- UTILISATEURS ---
  async getUsers() {
    const response = await fetch(`${API_URL}/api/users`, {
      headers: authHeaders()
    });
    const data = await parseResponse(response);
    if (!response.ok) {
      throw new Error((data as any)?.error || 'Erreur lors du chargement des utilisateurs');
    }
    return data;
  },

  async createUser(userData: { email: string; mot_de_passe: string; role?: UserRole; statut?: UserStatut }) {
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        email: userData.email.trim().toLowerCase(),
        mot_de_passe: userData.mot_de_passe.trim(),
        role: userData.role,
        statut: userData.statut
      })
    });
    const data = await parseResponse(response);
    if (!response.ok) {
      throw new Error((data as any)?.error || "Erreur lors de la création de l'utilisateur");
    }
    return data;
  },

  async updateUser(id: number, userData: { email?: string; mot_de_passe?: string; role?: UserRole; statut?: UserStatut }) {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        email: userData.email?.trim().toLowerCase(),
        mot_de_passe: userData.mot_de_passe?.trim(),
        role: userData.role,
        statut: userData.statut
      })
    });
    const data = await parseResponse(response);
    if (!response.ok) {
      throw new Error((data as any)?.error || "Erreur lors de la modification de l'utilisateur");
    }
    return data;
  },

  async deleteUser(id: number) {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    const data = await parseResponse(response);
    if (!response.ok) {
      throw new Error((data as any)?.error || "Erreur lors de la suppression de l'utilisateur");
    }
    return data;
  },

  async getStats() {
    const response = await fetch(`${API_URL}/api/stats`, {
      headers: authHeaders()
    });
    const data = await parseResponse(response);
    if (!response.ok) {
      throw new Error((data as any)?.error || 'Erreur lors du chargement des statistiques');
    }
    return data;
  },

  async getArticleMovements() {
    const response = await fetch(`${API_URL}/api/article-movements`, {
      headers: authHeaders()
    });
    const data = await parseResponse(response);
    if (!response.ok) {
      throw new Error((data as any)?.error || "Erreur lors du chargement des mouvements d'articles");
    }
    return data;
  }
};

export default ApiService;
