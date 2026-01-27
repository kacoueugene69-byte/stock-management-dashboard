// services/api.ts

export type UserRole = 'superadmin' | 'admin' | 'gerant' | 'vendeur';
export type UserStatut = 'actif' | 'inactif';

export type RegisterPayload = {
  email: string;
  mot_de_passe: string;
  role?: UserRole;
  statut?: UserStatut;
};

export type LoginResponse = {
  token: string;
  user: {
    id: number;
    email: string;
    role: UserRole;
    statut: UserStatut;
    created_at: string;
  };
  message: string;
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

// Configuration API
const RAW_API_URL = (import.meta as any).env?.VITE_API_URL;
const API_URL = (RAW_API_URL && RAW_API_URL.trim().replace(/\/+$/, '')) || 'http://localhost:5000';

console.log('🔗 API_URL utilisée:', API_URL);

// Gestion centralisée des tokens
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('gstock_token', token);
  } else {
    localStorage.removeItem('gstock_token');
  }
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem('gstock_token');
  }
  return authToken;
}

export function loadAuthTokenFromStorage() {
  const t = localStorage.getItem('gstock_token');
  authToken = t;
  return t;
}

// Headers automatiques avec token
function authHeaders(): Record<string, string> {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Parsing robuste des réponses
async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Erreur HTTP ${response.status}`);
    }
    return data;
  }
  
  // Gérer les réponses non-JSON
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `Erreur HTTP ${response.status}`);
  }
  
  // Retourner le texte brut si ce n'est pas du JSON
  return text as T;
}

export const ApiService = {
  // Authentification
  async login(payload: { email: string; mot_de_passe: string }): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
        mot_de_passe: payload.mot_de_passe.trim()
      })
    });

    const data = await parseResponse<LoginResponse>(response);
    
    // Stockage automatique du token
    if (data.token) {
      setAuthToken(data.token);
    }
    
    return data;
  },

  async register(payload: RegisterPayload): Promise<LoginResponse> {
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

    const data = await parseResponse<LoginResponse>(response);
    
    // Stockage automatique du token après inscription
    if (data.token) {
      setAuthToken(data.token);
    }
    
    return data;
  },

  // Utilisateur actuel
  async getCurrentUser() {
    const response = await fetch(`${API_URL}/api/me`, {
      headers: authHeaders()
    });
    
    const data = await parseResponse(response);
    if (!response.ok) {
      throw new Error((data as any)?.error || 'Erreur lors du chargement de l\'utilisateur');
    }
    return data;
  },

  // Utilisateurs
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

  // Statistiques
  async getStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_URL}/api/stats`, {
      headers: authHeaders()
    });
    
    const data = await parseResponse<DashboardStats>(response);
    if (!response.ok) {
      throw new Error((data as any)?.error || 'Erreur lors du chargement des statistiques');
    }
    return data;
  },

  async getArticleMovements(): Promise<ArticleMovements> {
    const response = await fetch(`${API_URL}/api/article-movements`, {
      headers: authHeaders()
    });
    
    const data = await parseResponse<ArticleMovements>(response);
    if (!response.ok) {
      throw new Error((data as any)?.error || "Erreur lors du chargement des mouvements d'articles");
    }
    return data;
  }
};

export default ApiService;
