import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import TableActions from './TableActions';
import { useNotification } from '../hooks/useNotification';
import { ProductIcon } from './icons';
import { Article } from '../types';
import { ApiService } from '../services/api';

const ProductPage: React.FC = () => {
    const [products, setProducts] = useState<Article[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<Article> | null>(null);
    const [productToDelete, setProductToDelete] = useState<Article | null>(null);
    const { showNotification } = useNotification();
    
    const [formState, setFormState] = useState<Partial<Article>>({});

    // Chargement initial
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [articlesData, categoriesData] = await Promise.all([
                    ApiService.getArticles(),
                    ApiService.getCategories()
                ]);
                setProducts(articlesData);
                setCategories(categoriesData);
            } catch (error) {
                showNotification("Erreur de connexion à la base de données", "error");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [showNotification]);

    // Initialisation du formulaire
    useEffect(() => {
        if (currentProduct) {
            setFormState(currentProduct);
        } else {
            setFormState({ 
                code_article: `PROD-${Date.now().toString().slice(-6)}`,
                nom_article: '',
                quantite_stock: 0, 
                seuil_alerte: 5, 
                statut: 'actif', 
                type_conditionnement: 'sac',
                prix_achat: 0,
                prix_vente: 0,
                poids: 0, // Ajout du poids initial
                id_categorie: undefined
            });
        }
    }, [currentProduct, isModalOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOpenAddModal = () => {
        setCurrentProduct(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (product: Article) => {
        setCurrentProduct(product);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (product: Article) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setCurrentProduct(null);
        setProductToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        if (!productToDelete?.id) return;
        try {
            setIsLoading(true);
            await ApiService.deleteArticle(productToDelete.id);
            setProducts(products.filter(p => p.id !== productToDelete.id));
            showNotification('Produit supprimé', 'success');
            handleCloseModals();
        } catch (err) {
            showNotification("Erreur lors de la suppression", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const productData = {
                ...formState,
                prix_achat: parseFloat(String(formState.prix_achat || 0)),
                prix_vente: parseFloat(String(formState.prix_vente || 0)),
                poids: parseFloat(String(formState.poids || 0)), // Conversion du poids
                quantite_stock: parseInt(String(formState.quantite_stock || 0)),
                id_categorie: formState.id_categorie ? parseInt(String(formState.id_categorie)) : null,
                seuil_alerte: parseInt(String(formState.seuil_alerte || 5))
            };

            if (currentProduct?.id) {
                const updated = await ApiService.updateArticle(currentProduct.id, productData);
                setProducts(products.map(p => p.id === updated.id ? updated : p));
                showNotification('Mis à jour !', 'success');
            } else {
                const created = await ApiService.createArticle(productData);
                setProducts([created, ...products]);
                showNotification('Enregistré !', 'success');
            }
            handleCloseModals();
        } catch (err) {
            showNotification("Échec de l'enregistrement", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4">
            {/* Header omitted for brevity */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Gestion des Produits</h1>
                <button onClick={handleOpenAddModal} className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800">
                    Ajouter un produit
                </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                                <th className="py-3 px-4">Article</th>
                                <th className="py-3 px-4">Code</th>
                                <th className="py-3 px-4 text-center">Poids</th>
                                <th className="py-3 px-4 text-right">P. Vente</th>
                                <th className="py-3 px-4 text-center">Stock</th>
                                <th className="py-3 px-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium text-gray-900">{product.nom_article}</td>
                                    <td className="py-3 px-4 text-xs font-mono text-gray-500">{product.code_article}</td>
                                    <td className="py-3 px-4 text-center text-gray-600">{product.poids} kg</td>
                                    <td className="py-3 px-4 text-right text-blue-700 font-bold">{product.prix_vente?.toLocaleString()} F</td>
                                    <td className="py-3 px-4 text-center font-semibold">{product.quantite_stock}</td>
                                    <td className="py-3 px-4 text-center">
                                        <TableActions onEdit={() => handleOpenEditModal(product)} onDelete={() => handleOpenDeleteModal(product)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModals} title={currentProduct ? "Modifier" : "Ajouter"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Nom de l'article</label>
                            <input type="text" name="nom_article" value={formState.nom_article || ''} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        
                        {/* CATEGORIES SELECTION */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                            <select 
                                name="id_categorie" 
                                value={formState.id_categorie || ''} 
                                onChange={handleChange} 
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Choisir une catégorie...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.nom_categorie}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* POIDS FIELD */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Poids (kg)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                name="poids" 
                                value={formState.poids || ''} 
                                onChange={handleChange} 
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Prix d'achat</label>
                            <input type="number" name="prix_achat" value={formState.prix_achat || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Prix de vente</label>
                            <input type="number" name="prix_vente" value={formState.prix_vente || ''} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 space-x-3">
                        <button type="button" onClick={handleCloseModals} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Annuler</button>
                        <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-700 rounded-md hover:bg-blue-800">Enregistrer</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ProductPage;