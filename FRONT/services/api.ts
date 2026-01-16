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

const API_BASE_URL: string = 'http://localhost:5001'; 

const jsonHeaders = { 'Content-Type': 'application/json' };

export const apiClient = {
  // AUTHENTIFICATION
  register: async (userData: RegisterPayload): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error(`Erreur: ${response.status}`);
    return response.json();
  },

  login: async (credentials: Credentials): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error(`Erreur: ${response.status}`);
    return response.json();
  },

  // ARTICLES
  getArticles: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/api/articles`);
    if (!response.ok) throw new Error(`Erreur: ${response.status}`);
    return response.json();
  },

  createArticle: async (articleData: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/articles`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(articleData),
    });
    if (!response.ok) throw new Error(`Erreur: ${response.status}`);
    return response.json();
  },

  updateArticle: async (id: number, articleData: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify(articleData),
    });
    if (!response.ok) throw new Error(`Erreur: ${response.status}`);
    return response.json();
  },

  deleteArticle: async (id: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`Erreur: ${response.status}`);
    return response.json();
  },

  getCategories: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    if (!response.ok) throw new Error(`Erreur: ${response.status}`);
    return response.json();
  }
};

// LA LIGNE CI-DESSOUS CORRIGE L'ERREUR DANS LA CONSOLE
export const ApiService = apiClient; 
export default apiClient;