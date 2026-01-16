
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import TableActions from './TableActions';
import { useNotification } from '../hooks/useNotification';

const userAvatarSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="lightgray" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`;
const userAvatarDataUrl = `data:image/svg+xml;base64,${btoa(userAvatarSvg)}`;

type User = { 
    id: number;
    id_personnel: number;
    nom_utilisateur: string;
    email: string;
    role: string;
    derniere_connexion: string;
    statut: string;
    photoUrl: string;
};

const UserPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [formState, setFormState] = useState<Partial<User>>({});
    const { showNotification } = useNotification();

    useEffect(() => {
        if (currentUser) {
            setFormState(currentUser);
        } else {
            setFormState({ role: 'vendeur', statut: 'actif', photoUrl: userAvatarDataUrl });
        }
    }, [currentUser]);

    const handleOpenAddModal = () => {
        setCurrentUser(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (user: User) => {
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setCurrentUser(null);
        setUserToDelete(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser?.id) {
            setUsers(users.map(u => u.id === currentUser.id ? { ...u, ...formState, id: u.id } as User : u));
            showNotification('Utilisateur modifié avec succès !', 'success');
        } else {
            const newUser = { ...formState, id: Date.now() } as User;
            setUsers([...users, newUser]);
            showNotification('Utilisateur ajouté avec succès !', 'success');
        }
        handleCloseModals();
    };

    const handleDeleteConfirm = () => {
        if (userToDelete) {
            setUsers(users.filter(u => u.id !== userToDelete.id));
            showNotification('Utilisateur supprimé avec succès !', 'success');
            handleCloseModals();
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormState({ ...formState, photoUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Gestion des Utilisateurs</h1>
                <button onClick={handleOpenAddModal} className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Ajouter un utilisateur
                </button>
            </div>

            <div className="p-6 bg-white rounded-xl shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 font-medium text-gray-500">Photo</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Nom d'utilisateur</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Email</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Rôle</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Dernière connexion</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Statut</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? users.map(user => (
                                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-2 px-4">
                                        <img src={user.photoUrl} alt={user.nom_utilisateur} className="w-10 h-10 rounded-full object-cover"/>
                                    </td>
                                    <td className="py-3 px-4 font-semibold">{user.nom_utilisateur}</td>
                                    <td className="py-3 px-4">{user.email}</td>
                                    <td className="py-3 px-4">{user.role}</td>
                                    <td className="py-3 px-4">{user.derniere_connexion}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.statut}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <TableActions
                                            onEdit={() => handleOpenEditModal(user)}
                                            onDelete={() => handleOpenDeleteModal(user)}
                                        />
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-gray-500">Aucun utilisateur trouvé.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModals} title={currentUser ? "Modifier l'utilisateur" : "Ajouter un nouvel utilisateur"}>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Photo</label>
                            <div className="mt-2 flex items-center space-x-4">
                                <img 
                                    src={formState.photoUrl || userAvatarDataUrl} 
                                    alt="Avatar" 
                                    className="w-16 h-16 rounded-full object-cover bg-gray-100"
                                />
                                <label htmlFor="photo-upload" className="cursor-pointer px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                                    <span>Changer</span>
                                    <input id="photo-upload" name="photo" type="file" className="sr-only" onChange={handlePhotoChange} accept="image/*" />
                                </label>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="id_personnel" className="block text-sm font-medium text-gray-700">Personnel Associé</label>
                            <select id="id_personnel" name="id_personnel" value={formState.id_personnel || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option>Sélectionner un membre du personnel</option>
                                <option value="1">Fatou Bamba</option>
                                <option value="2">Ali Diomandé</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="nom_utilisateur" className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
                            <input type="text" name="nom_utilisateur" id="nom_utilisateur" value={formState.nom_utilisateur || ''} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" id="email" value={formState.email || ''} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                         <div>
                            <label htmlFor="mot_de_passe" className="block text-sm font-medium text-gray-700">Mot de passe</label>
                            <input type="password" name="mot_de_passe" id="mot_de_passe" required={!currentUser} placeholder={currentUser ? "Laisser vide pour ne pas changer" : ""} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rôle</label>
                            <select id="role" name="role" value={formState.role || 'vendeur'} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="superadmin">Super Admin</option>
                                <option value="admin">Admin</option>
                                <option value="gerant">Gérant</option>
                                <option value="vendeur">Vendeur</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="statut" className="block text-sm font-medium text-gray-700">Statut</label>
                            <select id="statut" name="statut" value={formState.statut || 'actif'} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="actif">Actif</option>
                                <option value="inactif">Inactif</option>
                                <option value="bloque">Bloqué</option>
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
                message={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userToDelete?.nom_utilisateur}" ?`}
            />
        </div>
    );
};

export default UserPage;