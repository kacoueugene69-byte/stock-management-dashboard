import React, { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import TableActions from './TableActions';
import { useNotification } from '../hooks/useNotification';
import apiClient from '../services/api';

/**
 * Aligné sur le modèle DB articles :
 * identifiant (PK), article_code, nom_article, prix_achat, prix_vente,
 * quantite_stock, seuil_alerte, id_categorie, statut, description
 *
 * - n'affiche que les champs existants en base
 * - n'envoie que ces champs au backend
 * - utilise `identifiant` comme clé primaire
 */

type ArticleFromApi = {
  identifiant: number;
  article_code: string;
  nom_article: string;
  prix_achat: string | number;
  prix_vente: string | number;
  quantite_stock: number;
  seuil_alerte: number;
  id_categorie?: number | null;
  statut?: string;
  description?: string | null;
};

const ProductPage: React.FC = () => {
  const [products, setProducts] = useState<ArticleFromApi[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<ArticleFromApi | null>(null);
  const [productToDelete, setProductToDelete] = useState<ArticleFromApi | null>(null);
  const { showNotification } = useNotification();

  const initialFormState = useMemo<Partial<ArticleFromApi>>(
    () => ({
      article_code: '',
      nom_article: '',
      prix_achat: null,
      prix_vente: null,
      quantite_stock: null,
      seuil_alerte: 5,
      id_categorie: null,
      statut: 'actif',
      description: ''
    }),
    []
  );

  const [formState, setFormState] = useState<Partial<ArticleFromApi>>(initialFormState);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const articlesPromise = (apiClient as any).getArticles ? (apiClient as any).getArticles() : Promise.resolve([]);
        const categoriesPromise = (apiClient as any).getCategories ? (apiClient as any).getCategories() : Promise.resolve([]);
        const [articlesData, categoriesData] = await Promise.all([articlesPromise, categoriesPromise]);

        setProducts(Array.isArray(articlesData) ? articlesData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error('Erreur chargement produits/catégories', err);
        showNotification('Erreur lors du chargement des produits', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [showNotification]);

  useEffect(() => {
    if (isModalOpen) {
      if (currentProduct) {
        setFormState({
          article_code: currentProduct.article_code,
          nom_article: currentProduct.nom_article,
          prix_achat: currentProduct.prix_achat ?? null,
          prix_vente: currentProduct.prix_vente ?? null,
          quantite_stock: currentProduct.quantite_stock ?? null,
          seuil_alerte: Number(currentProduct.seuil_alerte ?? 5),
          id_categorie: currentProduct.id_categorie ?? null,
          statut: currentProduct.statut ?? 'actif',
          description: currentProduct.description ?? ''
        });
      } else {
        setFormState({
          ...initialFormState,
          article_code: `PROD-${Math.floor(100000 + Math.random() * 900000)}`
        });
      }
    }
  }, [isModalOpen, currentProduct, initialFormState]);

  const openAddModal = () => {
    setCurrentProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: ArticleFromApi) => {
    setCurrentProduct(p);
    setIsModalOpen(true);
  };

  const openDeleteModal = (p: ArticleFromApi) => {
    setProductToDelete(p);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentProduct(null);
    setProductToDelete(null);
    setFormState(initialFormState);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    const numericFields = ['prix_achat', 'prix_vente', 'quantite_stock', 'seuil_alerte', 'id_categorie'];

    if (numericFields.includes(name)) {
      const parsed = value === '' ? null : Number(value);
      setFormState(prev => ({ ...prev, [name]: isNaN(parsed) ? null : parsed }));
    } else {
      setFormState(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload: Partial<ArticleFromApi> = {
        article_code: String(formState.article_code ?? '').trim(),
        nom_article: String(formState.nom_article ?? '').trim(),
        prix_achat: Number(formState.prix_achat ?? null),
        prix_vente: Number(formState.prix_vente ?? null),
        quantite_stock: Number(formState.quantite_stock ?? null),
        seuil_alerte: Number(formState.seuil_alerte ?? 5),
        id_categorie: formState.id_categorie === '' ? null : (formState.id_categorie ?? null),
        statut: String(formState.statut ?? 'actif'),
        description: formState.description ?? null
      };

      if (!payload.article_code || !payload.nom_article || payload.prix_vente === undefined) {
        showNotification('article_code, nom_article et prix_vente sont requis', 'error');
        setIsLoading(false);
        return;
      }

      if (currentProduct && currentProduct.identifiant) {
        if (typeof (apiClient as any).updateArticle !== 'function') {
          throw new Error('updateArticle non disponible dans apiClient');
        }
        const updated = await (apiClient as any).updateArticle(currentProduct.identifiant, payload);
        setProducts(prev => prev.map(p => (p.identifiant === updated.identifiant ? updated : p)));
        showNotification('Article mis à jour', 'success');
      } else {
        if (typeof (apiClient as any).createArticle !== 'function') {
          throw new Error('createArticle non disponible dans apiClient');
        }
        const created = await (apiClient as any).createArticle(payload);
        setProducts(prev => [created, ...prev]);
        showNotification('Article créé', 'success');
      }

      closeModals();
    } catch (err: any) {
      console.error('Erreur enregistrement article', err);
      showNotification(err?.message ?? 'Erreur lors de l\'enregistrement', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete?.identifiant) return;
    setIsLoading(true);
    try {
      if (typeof (apiClient as any).deleteArticle !== 'function') {
        throw new Error('deleteArticle non disponible dans apiClient');
      }
      await (apiClient as any).deleteArticle(productToDelete.identifiant);
      setProducts(prev => prev.filter(p => p.identifiant !== productToDelete.identifiant));
      showNotification('Article supprimé', 'success');
    } catch (err: any) {
      console.error('Erreur suppression article', err);
      showNotification(err?.message ?? 'Erreur lors de la suppression', 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-semibold">Gestion des Produits</h1>
        <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded-md">
          Ajouter un produit
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs uppercase text-gray-500 font-bold">
              <th className="py-4 px-4">Article</th>
              <th className="py-4 px-4">Code</th>
              <th className="py-4 px-4 text-right">P. Vente</th>
              <th className="py-4 px-4 text-center">Stock</th>
              <th className="py-4 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.length > 0 ? (
              products.map(product => (
                <tr key={product.identifiant} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{product.nom_article}</td>
                  <td className="py-3 px-4 text-gray-500 font-mono">{product.article_code}</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-700">
                    {Number(product.prix_vente ?? 0).toLocaleString('fr-FR')} F
                  </td>
                  <td className="py-3 px-4 text-center">{product.quantite_stock ?? 0}</td>
                  <td className="py-3 px-4 text-center">
                    <TableActions
                      onEdit={() => openEditModal(product)}
                      onDelete={() => openDeleteModal(product)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  {isLoading ? 'Chargement...' : 'Aucun produit trouvé.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModals} title={currentProduct ? "Modifier l'article" : "Ajouter"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Code article</label>
            <input
              type="text"
              name="article_code"
              value={formState.article_code ?? ''}
              onChange={handleChange}
              readOnly
              className="w-full border rounded-md p-2 mt-1 bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Nom de l'article</label>
            <input
              type="text"
              name="nom_article"
              value={formState.nom_article ?? ''}
              onChange={handleChange}
              required
              className="w-full border rounded-md p-2 mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Catégorie</label>
              <select
                name="id_categorie"
                value={formState.id_categorie ?? ''}
                onChange={handleChange}
                className="w-full border rounded-md p-2 mt-1"
              >
                <option value="">Choisir...</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nom_categorie ?? cat.nom ?? cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Prix de vente</label>
              <input
                type="number"
                name="prix_vente"
                value={formState.prix_vente ?? ''}
                onChange={handleChange}
                required
                className="w-full border rounded-md p-2 mt-1"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Prix d'achat</label>
              <input
                type="number"
                name="prix_achat"
                value={formState.prix_achat ?? ''}
                onChange={handleChange}
                className="w-full border rounded-md p-2 mt-1"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Quantité en stock</label>
              <input
                type="number"
                name="quantite_stock"
                value={formState.quantite_stock ?? ''}
                onChange={handleChange}
                className="w-full border rounded-md p-2 mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Seuil d'alerte</label>
              <input
                type="number"
                name="seuil_alerte"
                value={formState.seuil_alerte ?? ''}
                onChange={handleChange}
                className="w-full border rounded-md p-2 mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Statut</label>
              <select
                name="statut"
                value={formState.statut ?? 'actif'}
                onChange={handleChange}
                className="w-full border rounded-md p-2 mt-1"
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={formState.description ?? ''}
              onChange={handleChange}
              className="w-full border rounded-md p-2 mt-1"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={closeModals} className="px-4 py-2 border rounded-md">
              Annuler
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded-md">
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Supprimer l'article"
        message={`Voulez-vous vraiment supprimer "${productToDelete?.nom_article ?? ''}" ? Cette action est irréversible.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => { setIsDeleteModalOpen(false); setProductToDelete(null); }}
      />
    </div>
  );
};

export default ProductPage;
