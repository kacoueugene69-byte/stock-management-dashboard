// services/api.js (ou api.ts)
const API_URL = import.meta.env.VITE_API_URL || 'https://gstock-backend.onrender.com';

const apiClient = {
  // Auth
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      throw new Error('Échec de la connexion');
    }
    
    return response.json();
  },

  // Articles
  getArticles: async () => {
    const response = await fetch(`${API_URL}/api/articles`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des articles');
    return response.json();
  },

  // Categories
  getCategories: async () => {
    const response = await fetch(`${API_URL}/api/categories`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des catégories');
    return response.json();
  },

  // Magasins
  getMagasins: async () => {
    const response = await fetch(`${API_URL}/api/magasins`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des magasins');
    return response.json();
  },

  // Stats
  getStats: async () => {
    const response = await fetch(`${API_URL}/api/stats`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des stats');
    return response.json();
  }
};

export default apiClient;