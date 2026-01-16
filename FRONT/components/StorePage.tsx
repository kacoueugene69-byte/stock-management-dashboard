
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import TableActions from './TableActions';
import { useNotification } from '../hooks/useNotification';

type Store = { 
    id: number;
    nom_magasin: string;
    adresse: string;
    ville: string;
    telephone: string;
    directeur: string;
    statut: string;
};

const StorePage: React.FC = () => {
    const [stores, setStores] = useState<Store[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentStore, setCurrentStore] = useState<Partial<Store> | null>(null);
    const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);
    const [formState, setFormState] = useState<Partial<Store>>({});
    const { showNotification } = useNotification();

    useEffect(() => {
        if (currentStore) {
            setFormState(currentStore);
        } else {
            setFormState({ statut: 'actif' });
        }
    }, [currentStore]);

    const handleOpenAddModal = () => {
        setCurrentStore(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (store: Store) => {
        setCurrentStore(store);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (store: Store) => {
        setStoreToDelete(store);
        setIsDeleteModalOpen(true);
    };
    
    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setCurrentStore(null);
        setStoreToDelete(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStore?.id) {
            setStores(stores.map(s => s.id === currentStore.id ? { ...s, ...formState, id: s.id } as Store : s));
            showNotification('Magasin modifié avec succès !', 'success');
        } else {
            const newStore = { ...formState, id: Date.now() } as Store;
            setStores([...stores, newStore]);
            showNotification('Magasin ajouté avec succès !', 'success');
        }
        handleCloseModals();
    };

    const handleDeleteConfirm = () => {
        if (storeToDelete) {
            setStores(stores.filter(s => s.id !== storeToDelete.id));
            showNotification('Magasin supprimé avec succès !', 'success');
            handleCloseModals();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Gestion des Magasins</h1>
                <button onClick={handleOpenAddModal} className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Ajouter un magasin
                </button>
            </div>

            <div className="p-6 bg-white rounded-xl shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 font-medium text-gray-500">Nom Magasin</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Ville</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Téléphone</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Directeur</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Statut</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.length > 0 ? stores.map(store => (
                                <tr key={store.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-semibold">{store.nom_magasin}</td>
                                    <td className="py-3 px-4">{store.ville}</td>
                                    <td className="py-3 px-4">{store.telephone}</td>
                                    <td className="py-3 px-4">{store.directeur}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${store.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {store.statut}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <TableActions
                                            onEdit={() => handleOpenEditModal(store)}
                                            onDelete={() => handleOpenDeleteModal(store)}
                                        />
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500">Aucun magasin trouvé.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
             <Modal isOpen={isModalOpen} onClose={handleCloseModals} title={currentStore ? "Modifier le magasin" : "Ajouter un nouveau magasin"}>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="nom_magasin" className="block text-sm font-medium text-gray-700">Nom du Magasin</label>
                            <input type="text" name="nom_magasin" id="nom_magasin" value={formState.nom_magasin || ''} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="directeur" className="block text-sm font-medium text-gray-700">Directeur</label>
                            <input type="text" name="directeur" id="directeur" value={formState.directeur || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                         <div className="md:col-span-2">
                            <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">Adresse</label>
                            <input type="text" name="adresse" id="adresse" value={formState.adresse || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="ville" className="block text-sm font-medium text-gray-700">Ville</label>
                            <input type="text" name="ville" id="ville" value={formState.ville || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                         <div>
                            <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                            <input type="tel" name="telephone" id="telephone" value={formState.telephone || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" id="email" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="statut" className="block text-sm font-medium text-gray-700">Statut</label>
                            <select id="statut" name="statut" value={formState.statut || 'actif'} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="actif">Actif</option>
                                <option value="inactif">Inactif</option>
                            </select>
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
                message={`Êtes-vous sûr de vouloir supprimer le magasin "${storeToDelete?.nom_magasin}" ?`}
            />
        </div>
    );
};

export default StorePage;