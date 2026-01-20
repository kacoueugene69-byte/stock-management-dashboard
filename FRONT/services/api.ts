// services/api.ts

export type RegisterPayload = {
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  photo_url?: string;
};

const API_URL = 'https://gstock-backend.onrender.com';

const apiClient = {
  // Inscription
  register: async (userData: RegisterPayload) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur lors de l\'inscription');
    return data;
  },

  // Connexion
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
  
  // Ajoutez cette ligne pour la compatibilité avec vos autres pages
  getArticles: async () => { /* ... voir code précédent ... */ },

  // Staff management
  getStaff: async () => {
    const response = await fetch(`${API_URL}/api/staff`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur lors du chargement du personnel');
    return data;
  },

  createStaff: async (staffData: Partial<StaffMember>) => {
    const response = await fetch(`${API_URL}/api/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staffData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur lors de la création du membre');
    return data;
  },

  updateStaff: async (id: number, staffData: Partial<StaffMember>) => {
    const response = await fetch(`${API_URL}/api/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staffData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur lors de la modification du membre');
    return data;
  },

  deleteStaff: async (id: number) => {
    const response = await fetch(`${API_URL}/api/staff/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur lors de la suppression du membre');
    return data;
  },

  getMagasins: async () => {
    const response = await fetch(`${API_URL}/api/magasins`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur lors du chargement des magasins');
    return data;
  },
};

export const ApiService = apiClient; // Important pour ProductPage.tsx
export default apiClient;