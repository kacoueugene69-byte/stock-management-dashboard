
import { Article, Categorie, Vente } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Service pour interagir avec le serveur Node.js/PostgreSQL
 */
export const ApiService = {
    // ARTICLES
    getArticles: async (): Promise<Article[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/articles`);
            if (!response.ok) throw new Error('Erreur réseau');
            return await response.json();
        } catch (error) {
            console.error("Erreur getArticles:", error);
            throw error;
        }
    },

    saveArticle: async (article: Partial<Article>): Promise<Article> => {
        const isUpdate = !!article.id;
        const url = isUpdate ? `${API_BASE_URL}/articles/${article.id}` : `${API_BASE_URL}/articles`;
        const method = isUpdate ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(article)
            });
            if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
            return await response.json();
        } catch (error) {
            console.error("Erreur saveArticle:", error);
            throw error;
        }
    },

    deleteArticle: async (id: number): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Erreur lors de la suppression');
        } catch (error) {
            console.error("Erreur deleteArticle:", error);
            throw error;
        }
    },

    // CATEGORIES (À implémenter sur le serveur de la même manière)
    getCategories: async (): Promise<Categorie[]> => {
        const response = await fetch(`${API_BASE_URL}/categories`);
        return response.ok ? await response.json() : [];
    },

    // STATISTIQUES (Requêtes complexes avec agrégation SQL)
    getStats: async () => {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (response.ok) return await response.json();
        return { totalRevenue: 0, totalSales: 0, totalProfit: 0, pendingOrders: 0 };
    }
};
