
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
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<Article> | null>(null);
    const [productToDelete, setProductToDelete] = useState<Article | null>(null);
    const { showNotification } = useNotification();
    
    const [formState, setFormState] = useState<Partial<Article>>({});

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await ApiService.getArticles();
                setProducts(data);
            } catch (error) {
                showNotification("Erreur de connexion à la base de données", "error");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (currentProduct) {
            setFormState(currentProduct);
        } else {
            setFormState({ 
                code_article: `PROD-${Date.now().toString().slice(-6)}`,
                quantite_stock: 0, 
                seuil_alerte: 5, 
                statut: 'actif', 
                type_conditionnement: 'sac',
                prix_achat: 0,
                prix_vente: 0
            });
        }
    }, [currentProduct]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const saved = await ApiService.saveArticle(formState);
            if (currentProduct?.id) {
                setProducts(products.map(p => p.id === saved.id ? saved : p));
                showNotification('Produit mis à jour dans Postgres !', 'success');
            } else {
                setProducts([...products, saved]);
                showNotification('Produit enregistré dans Postgres !', 'success');
            }
            handleCloseModals();
        } catch (err) {
            showNotification('Erreur lors de l\'enregistrement', 'error');
        }
    };

    const handleDeleteConfirm = () => {
        if (productToDelete) {
            setProducts(products.filter(p => p.id !== productToDelete.id));
            showNotification('Produit supprimé !', 'success');
            handleCloseModals();
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormState({ 
            ...formState, 
            [name]: type === 'number' ? parseFloat(value) || 0 : value 
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Gestion des Produits (Postgres ready)</h1>
                <button onClick={handleOpenAddModal} className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Ajouter un produit
                </button>
            </div>

            <div className="p-6 bg-white rounded-xl shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 font-medium text-gray-500">Icône</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Code</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Nom Article</th>
                                <th className="py-3 px-4 font-medium text-gray-500">P. Achat</th>
                                <th className="py-3 px-4 font-medium text-gray-500">P. Vente</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Stock</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Statut</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={8} className="py-8 text-center text-gray-400">Synchronisation avec la base de données...</td></tr>
                            ) : products.length > 0 ? products.map(product => (
                                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-2 px-4">
                                        <div className="w-10 h-10 flex items-center justify-center rounded-md bg-gray-100 text-gray-400">
                                            <ProductIcon className="w-5 h-5" />
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-xs font-mono">{product.code_article}</td>
                                    <td className="py-3 px-4 font-semibold">{product.nom_article}</td>
                                    <td className="py-3 px-4">{product.prix_achat?.toLocaleString('fr-FR')} F</td>
                                    <td className="py-3 px-4 text-blue-700 font-bold">{product.prix_vente?.toLocaleString('fr-FR')} F</td>
                                    <td className="py-3 px-4">
                                        <span className={product.quantite_stock <= product.seuil_alerte ? "text-red-600 font-bold" : ""}>
                                            {product.quantite_stock}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {product.statut}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <TableActions
                                            onEdit={() => handleOpenEditModal(product)}
                                            onDelete={() => handleOpenDeleteModal(product)}
                                        />
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-gray-500">Aucun produit trouvé dans Postgres.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModals} title={currentProduct ? "Modifier dans Postgres" : "Ajouter dans Postgres"}>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="code_article" className="block text-sm font-medium text-gray-700">Code Article (Unique)</label>
                            <input 
                                type="text" 
                                name="code_article" 
                                id="code_article" 
                                value={formState.code_article || ''} 
                                onChange={handleChange}
                                required
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="nom_article" className="block text-sm font-medium text-gray-700">Nom Article</label>
                            <input type="text" name="nom_article" id="nom_article" value={formState.nom_article || ''} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="id_categorie" className="block text-sm font-medium text-gray-700">Catégorie</label>
                            <select id="id_categorie" name="id_categorie" value={formState.id_categorie || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="">Sélectionner une catégorie</option>
                                <option value="1">Aliments</option>
                                <option value="2">Vétérinaire</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="prix_achat" className="block text-sm font-medium text-gray-700">Prix d'achat (Decimal)</label>
                            <input type="number" name="prix_achat" id="prix_achat" value={formState.prix_achat || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                         <div>
                            <label htmlFor="prix_vente" className="block text-sm font-medium text-gray-700">Prix de vente (Decimal)</label>
                            <input type="number" name="prix_vente" id="prix_vente" value={formState.prix_vente || ''} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                         <div>
                            <label htmlFor="poids" className="block text-sm font-medium text-gray-700">Poids / Volume</label>
                            <input type="text" name="poids" id="poids" value={formState.poids || ''} onChange={handleChange} placeholder="ex: 50kg" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="type_conditionnement" className="block text-sm font-medium text-gray-700">Type Conditionnement</label>
                            <select id="type_conditionnement" name="type_conditionnement" value={formState.type_conditionnement || 'sac'} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="sac">Sac</option>
                                <option value="carton">Carton</option>
                                <option value="unité">Unité</option>
                                <option value="bouteille">Bouteille</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="quantite_stock" className="block text-sm font-medium text-gray-700">Stock Actuel</label>
                            <input type="number" name="quantite_stock" id="quantite_stock" value={formState.quantite_stock || 0} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                    </div>
                    <div className="flex justify-end mt-6 space-x-4">
                        <button type="button" onClick={handleCloseModals} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                            Annuler
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-700 border border-transparent rounded-md shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Synchroniser Postgres
                        </button>
                    </div>
                </form>
            </Modal>
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                onConfirm={handleDeleteConfirm}
                title="Confirmer la suppression"
                message={`Êtes-vous sûr de vouloir supprimer "${productToDelete?.nom_article}" de la base de données ?`}
            />
        </div>
    );
};

export default ProductPage;
