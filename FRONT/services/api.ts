// FRONT/services/api.ts

type Credentials = { nom_utilisateur: string; mot_de_passe: string };
type RegisterPayload = {
  nom_utilisateur: string;
  email: string;
  mot_de_passe: string;
  nom?: string;
  prenom?: string;
  role?: string;
};

const API_BASE_URL: string =
  (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:5000';

const jsonHeaders = { 'Content-Type': 'application/json' };

export const apiClient = {
  // AUTHENTIFICATION
  register: async (userData: RegisterPayload): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: jsonHeaders,
      credentials: 'include',
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error(`Erreur: ${response.status}`);
    return response.json();
  },

  login: async (credentials: Credentials): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: jsonHeaders,
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error(`Erreur: ${response.status}`);
    return response.json();
  },

  // UTILISATEURS
  getUsers: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/utilisateurs`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Erreur: ${response.status}`);
    return response.json();
  },

  // ARTICLES
  getArticles: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/api/articles`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Erreur: ${response.status}`);
    return response.json();
  },

  getArticleById: async (id: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Erreur: ${response.status}`);
    return response.json();
  },

  createArticle: async (articleData: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/articles`, {
      method: 'POST',
      headers: jsonHeaders,
      credentials: 'include',
      body: JSON.stringify(articleData),
    });
    if (!response.ok) throw new Error(`Erreur: ${response.status}`);
    return response.json();
  },

  updateArticle: async (id: number, articleData: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, {
      method: 'PUT',
      headers: jsonHeaders,
      credentials: 'include',
      body: JSON.stringify(articleData),
    });
    if (!response.ok) throw new Error(`Erreur: ${response.status}`);
    return response.json();
  },

  deleteArticle: async (id: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Erreur: ${response.status}`);
    return response.json();
  },

  // CATÉGORIES
  getCategories: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Erreur: ${response.status}`);
    return response.json();
  },

  createCategory: async (categoryData: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'POST',
      headers: jsonHeaders,
      credentials: 'include',
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) throw new Error(`Erreur: ${response.status}`);
    return response.json();
  },

  // STATS
  getStats: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/stats`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Erreur: ${response.status}`);
    return response.json();
  },

  // HEALTH CHECK
  checkHealth: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (!response.ok) throw new Error(`Erreur: ${response.status}`);
    return response.json();
  },
};

export default apiClient;