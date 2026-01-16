
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import TableActions from './TableActions';
import { useNotification } from '../hooks/useNotification';

type Client = { 
    id: number;
    code_client: string;
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    ville: string;
    points_fidelite: number;
};

const ClientPage: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState<Partial<Client> | null>(null);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const [formState, setFormState] = useState<Partial<Client>>({});
    const { showNotification } = useNotification();

    useEffect(() => {
        if (currentClient) {
            setFormState(currentClient);
        } else {
            setFormState({ points_fidelite: 0 });
        }
    }, [currentClient]);
    
    const handleOpenAddModal = () => {
        setCurrentClient(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (client: Client) => {
        setCurrentClient(client);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (client: Client) => {
        setClientToDelete(client);
        setIsDeleteModalOpen(true);
    };
    
    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setCurrentClient(null);
        setClientToDelete(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentClient?.id) {
            setClients(clients.map(c => c.id === currentClient.id ? { ...c, ...formState, id: c.id } as Client : c));
            showNotification('Client modifié avec succès !', 'success');
        } else {
            const newClient = { ...formState, id: Date.now(), code_client: `CLI${Date.now().toString().slice(-4)}` } as Client;
            setClients([...clients, newClient]);
            showNotification('Client ajouté avec succès !', 'success');
        }
        handleCloseModals();
    };

    const handleDeleteConfirm = () => {
        if (clientToDelete) {
            setClients(clients.filter(c => c.id !== clientToDelete.id));
            showNotification('Client supprimé avec succès !', 'success');
            handleCloseModals();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Gestion des Clients</h1>
                <button onClick={handleOpenAddModal} className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Ajouter un client
                </button>
            </div>

            <div className="p-6 bg-white rounded-xl shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 font-medium text-gray-500">Code Client</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Nom Complet</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Téléphone</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Ville</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Points Fidélité</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.length > 0 ? clients.map(client => (
                                <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4">{client.code_client}</td>
                                    <td className="py-3 px-4 font-semibold">{`${client.prenom} ${client.nom}`}</td>
                                    <td className="py-3 px-4">{client.telephone}</td>
                                    <td className="py-3 px-4">{client.ville}</td>
                                    <td className="py-3 px-4">{client.points_fidelite}</td>
                                    <td className="py-3 px-4">
                                        <TableActions
                                            onEdit={() => handleOpenEditModal(client)}
                                            onDelete={() => handleOpenDeleteModal(client)}
                                        />
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500">Aucun client trouvé.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModals} title={currentClient ? 'Modifier le client' : 'Ajouter un nouveau client'}>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="code_client" className="block text-sm font-medium text-gray-700">Code Client</label>
                            <input type="text" name="code_client" id="code_client" value={formState.code_client || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                         <div>
                            <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
                            <input type="text" name="nom" id="nom" value={formState.nom || ''} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">Prénom</label>
                            <input type="text" name="prenom" id="prenom" value={formState.prenom || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                         <div>
                            <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                            <input type="tel" name="telephone" id="telephone" value={formState.telephone || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" id="email" value={formState.email || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">Adresse</label>
                            <input type="text" name="adresse" id="adresse" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="ville" className="block text-sm font-medium text-gray-700">Ville</label>
                            <input type="text" name="ville" id="ville" value={formState.ville || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="points_fidelite" className="block text-sm font-medium text-gray-700">Points de Fidélité</label>
                            <input type="number" name="points_fidelite" id="points_fidelite" value={formState.points_fidelite || 0} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
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
                message={`Êtes-vous sûr de vouloir supprimer le client ${clientToDelete?.prenom} ${clientToDelete?.nom} ?`}
            />
        </div>
    );
};

export default ClientPage;