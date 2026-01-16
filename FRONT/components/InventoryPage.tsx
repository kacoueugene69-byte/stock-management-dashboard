
import React, { useState } from 'react';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import TableActions from './TableActions';

type Inventory = { 
    id: number;
    id_magasin: string;
    date_inventaire: string;
    statut: string;
    id_utilisateur: string;
};

const InventoryPage: React.FC = () => {
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentInventory, setCurrentInventory] = useState<Partial<Inventory> | null>(null);
    const [inventoryToDelete, setInventoryToDelete] = useState<Inventory | null>(null);

    const openModal = () => {
        setCurrentInventory(null);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentInventory(null);
    };

    const handleOpenEditModal = (inventory: Inventory) => {
        setCurrentInventory(inventory);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (inventory: Inventory) => {
        setInventoryToDelete(inventory);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setCurrentInventory(null);
        setInventoryToDelete(null);
    };

    const handleDeleteConfirm = () => {
        if (inventoryToDelete) {
            setInventories(inventories.filter(inv => inv.id !== inventoryToDelete.id));
            handleCloseModals();
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Gestion d'Inventaire</h1>
                <button onClick={openModal} className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Démarrer un inventaire
                </button>
            </div>

            <div className="p-6 bg-white rounded-xl shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 font-medium text-gray-500">Magasin</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Date Inventaire</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Statut</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Initié par</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                             {inventories.length > 0 ? inventories.map(inv => (
                                <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-semibold">{inv.id_magasin}</td>
                                    <td className="py-3 px-4">{inv.date_inventaire}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${inv.statut === 'termine' ? 'bg-gray-200 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {inv.statut}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">{inv.id_utilisateur}</td>
                                    <td className="py-3 px-4">
                                        <TableActions
                                            onEdit={() => handleOpenEditModal(inv)}
                                            onDelete={() => handleOpenDeleteModal(inv)}
                                        />
                                    </td>
                                </tr>
                             )) : (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">Aucun inventaire trouvé.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title="Démarrer un nouvel inventaire">
                <form>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="id_magasin" className="block text-sm font-medium text-gray-700">Magasin</label>
                            <select id="id_magasin" name="id_magasin" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                               <option>Sélectionner un magasin</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="statut" className="block text-sm font-medium text-gray-700">Statut</label>
                            <select id="statut" name="statut" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="en cours">En cours</option>
                                <option value="termine">Terminé</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="id_utilisateur" className="block text-sm font-medium text-gray-700">Utilisateur</label>
                            <select id="id_utilisateur" name="id_utilisateur" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                               <option>Sélectionner un utilisateur</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                            <textarea id="notes" name="notes" rows={4} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
                        </div>
                    </div>
                    <div className="flex justify-end mt-6 space-x-4">
                        <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
                message={`Êtes-vous sûr de vouloir supprimer cet inventaire du ${inventoryToDelete?.date_inventaire} ?`}
            />
        </div>
    );
};

export default InventoryPage;