import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import TableActions from './TableActions';
import { useNotification } from '../hooks/useNotification';
import { Article } from '../types';
import apiClient from '../services/api';


const ProductPage: React.FC = () => {
    const [products, setProducts] = useState<Article[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Article | null>(null);
    const [productToDelete, setProductToDelete] = useState<Article | null>(null);
    const { showNotification } = useNotification();

    const initialFormState: Partial<Article> = useMemo(() => ({
        code_article: '',
        nom_article: '',
        quantite_stock: 0,
        seuil_alerte: 5,
        statut: 'actif',
        type_conditionnement: 'unité',
        prix_achat: 0,
        prix_vente: 0,
        poids: 0,
        id_categorie: undefined
    }), []);

    const [formState, setFormState] = useState<Partial<Article>>(initialFormState);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [articlesData, categoriesData] = await Promise.all([
                    apiClient.getArticles(),
                    apiClient.getCategories()
                ]);
                setProducts(articlesData);
                setCategories(categoriesData);
            } catch (error) {
                showNotification("Erreur de connexion", "error");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [showNotification]);

    useEffect(() => {
        if (isModalOpen) {
            // Correction ici : on s'assure que l'ID est conservé si on modifie
            setFormState(currentProduct ? { ...currentProduct } : {
                ...initialFormState,
                code_article: `PROD-${Math.floor(100000 + Math.random() * 900000)}`
            });
        }
    }, [currentProduct, isModalOpen, initialFormState]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Conversion explicite pour PostgreSQL (DECIMAL)
            const payload = {
                ...formState,
                prix_achat: Number(formState.prix_achat) || 0,
                prix_vente: Number(formState.prix_vente) || 0,
                poids: Number(formState.poids) || 0,
                id_categorie: formState.id_categorie ? Number(formState.id_categorie) : null,
            };

            // Correction de l'erreur 404 : on utilise l'ID de l'article sélectionné
            if (currentProduct?.id) {
                const updated = await apiClient.updateArticle(currentProduct.id, payload as Article);
                setProducts(products.map(p => p.id === updated.id ? updated : p));
                showNotification('Mis à jour !', 'success');
            } else {
                const created = await apiClient.createArticle(payload as Article);
                setProducts([created, ...products]);
                showNotification('Créé !', 'success');
            }
            setIsModalOpen(false);
        } catch (err) {
            showNotification("Erreur d'enregistrement", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete?.id) return;
        setIsLoading(true);
        try {
            await apiClient.deleteArticle(productToDelete.id);
            setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
            showNotification('Supprimé !', 'success');
        } catch (err) {
            showNotification("Erreur de suppression", "error");
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
                <button onClick={() => { setCurrentProduct(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-md">
                    Ajouter un produit
                </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr className="text-xs uppercase text-gray-500 font-bold">
                            <th className="py-4 px-4">Article</th>
                            <th className="py-4 px-4">Code</th>
                            <th className="py-4 px-4 text-center">Poids</th>
                            <th className="py-4 px-4 text-right">P. Vente</th>
                            <th className="py-4 px-4 text-center">Stock</th>
                            <th className="py-4 px-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {products.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="py-3 px-4">{product.nom_article}</td>
                                <td className="py-3 px-4 text-gray-500 font-mono">{product.code_article}</td>
                                <td className="py-3 px-4 text-center">{product.poids} kg</td>
                                <td className="py-3 px-4 text-right font-bold text-blue-700">{Number(product.prix_vente).toLocaleString()} F</td>
                                <td className="py-3 px-4 text-center">{product.quantite_stock}</td>
                                <td className="py-3 px-4 text-center">
                                    <TableActions 
                                        onEdit={() => { setCurrentProduct(product); setIsModalOpen(true); }} 
                                        onDelete={() => { setProductToDelete(product); setIsDeleteModalOpen(true); }} 
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentProduct ? "Modifier l'article" : "Ajouter"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Code article</label>
                        <input type="text" name="code_article" value={formState.code_article || ''} onChange={handleChange} readOnly className="w-full border rounded-md p-2 mt-1 bg-gray-100" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Nom de l'article</label>
                        <input type="text" name="nom_article" value={formState.nom_article || ''} onChange={handleChange} required className="w-full border rounded-md p-2 mt-1" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Catégorie</label>
                            <select name="id_categorie" value={formState.id_categorie || ''} onChange={handleChange} className="w-full border rounded-md p-2 mt-1">
                                <option value="">Choisir...</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.nom_categorie}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Poids (kg)</label>
                            <input type="number" step="0.01" name="poids" value={formState.poids ?? ''} onChange={handleChange} className="w-full border rounded-md p-2 mt-1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Prix d'achat</label>
                            <input type="number" name="prix_achat" value={formState.prix_achat ?? ''} onChange={handleChange} className="w-full border rounded-md p-2 mt-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Prix de vente</label>
                            <input type="number" name="prix_vente" value={formState.prix_vente ?? ''} onChange={handleChange} required className="w-full border rounded-md p-2 mt-1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Quantité en stock</label>
                            <input type="number" name="quantite_stock" value={formState.quantite_stock ?? ''} onChange={handleChange} className="w-full border rounded-md p-2 mt-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Seuil d'alerte</label>
                            <input type="number" name="seuil_alerte" value={formState.seuil_alerte ?? ''} onChange={handleChange} className="w-full border rounded-md p-2 mt-1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Statut</label>
                            <select name="statut" value={formState.statut || 'actif'} onChange={handleChange} className="w-full border rounded-md p-2 mt-1">
                                <option value="actif">Actif</option>
                                <option value="inactif">Inactif</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Conditionnement</label>
                            <select name="type_conditionnement" value={formState.type_conditionnement || 'unité'} onChange={handleChange} className="w-full border rounded-md p-2 mt-1">
                                <option value="unité">Unité</option>
                                <option value="carton">Carton</option>
                                <option value="paquet">Paquet</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md">Annuler</button>
                        <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded-md">Enregistrer</button>
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