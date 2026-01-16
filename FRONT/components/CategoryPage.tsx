
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import TableActions from './TableActions';
import { useNotification } from '../hooks/useNotification';

type Category = { 
    id: number;
    nom_categorie: string;
    description: string;
    date_creation: string;
};

const CategoryPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [formState, setFormState] = useState<Partial<Category>>({});
    const { showNotification } = useNotification();

    useEffect(() => {
        if (currentCategory) {
            setFormState(currentCategory);
        } else {
            setFormState({});
        }
    }, [currentCategory]);

    const handleOpenAddModal = () => {
        setCurrentCategory(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (category: Category) => {
        setCurrentCategory(category);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (category: Category) => {
        setCategoryToDelete(category);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setCurrentCategory(null);
        setCategoryToDelete(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentCategory?.id) {
            setCategories(categories.map(c => c.id === currentCategory.id ? { ...c, ...formState, id: c.id } as Category : c));
            showNotification('Catégorie modifiée avec succès !', 'success');
        } else {
            const newCategory = { 
                ...formState, 
                id: Date.now(),
                date_creation: new Date().toISOString().split('T')[0]
             } as Category;
            setCategories([...categories, newCategory]);
            showNotification('Catégorie ajoutée avec succès !', 'success');
        }
        handleCloseModals();
    };
    
    const handleDeleteConfirm = () => {
        if (categoryToDelete) {
            setCategories(categories.filter(c => c.id !== categoryToDelete.id));
            showNotification('Catégorie supprimée avec succès !', 'success');
            handleCloseModals();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Gestion des Catégories</h1>
                <button onClick={handleOpenAddModal} className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Ajouter une catégorie
                </button>
            </div>

            <div className="p-6 bg-white rounded-xl shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 font-medium text-gray-500">Nom Catégorie</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Description</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Date de création</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                             {categories.length > 0 ? categories.map(category => (
                                <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-semibold">{category.nom_categorie}</td>
                                    <td className="py-3 px-4 text-gray-600">{category.description}</td>
                                    <td className="py-3 px-4">{category.date_creation}</td>
                                    <td className="py-3 px-4">
                                        <TableActions
                                            onEdit={() => handleOpenEditModal(category)}
                                            onDelete={() => handleOpenDeleteModal(category)}
                                        />
                                    </td>
                                </tr>
                             )) : (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-gray-500">Aucune catégorie trouvée.</td>
                                </tr>
                             )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModals} title={currentCategory ? "Modifier la catégorie" : "Ajouter une nouvelle catégorie"}>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="nom_categorie" className="block text-sm font-medium text-gray-700">Nom de la Catégorie</label>
                            <input type="text" name="nom_categorie" id="nom_categorie" value={formState.nom_categorie || ''} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="description" name="description" rows={4} value={formState.description || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
                        </div>
                    </div>
                    <div className="flex justify-end mt-6 space-x-4">
                        <button type="button" onClick={handleCloseModals} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Annuler
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-700 border border-transparent rounded-md shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Enregistrer
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                onConfirm={handleDeleteConfirm}
                title="Confirmer la suppression"
                message={`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryToDelete?.nom_categorie}" ?`}
            />
        </div>
    );
};

export default CategoryPage;