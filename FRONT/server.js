// services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'https://gstock-backend.onrender.com';

export const api = {
  // Auth
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  },

  // Articles
  getArticles: async () => {
    const response = await fetch(`${API_URL}/api/articles`);
    return response.json();
  },

  // Categories
  getCategories: async () => {
    const response = await fetch(`${API_URL}/api/categories`);
    return response.json();
  },

  // Magasins
  getMagasins: async () => {
    const response = await fetch(`${API_URL}/api/magasins`);
    return response.json();
  },

  // Stats
  getStats: async () => {
    const response = await fetch(`${API_URL}/api/stats`);
    return response.json();
  }
};

export default api;