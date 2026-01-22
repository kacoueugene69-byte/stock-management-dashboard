import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import TableActions from './TableActions';
import { useNotification } from '../hooks/useNotification';
import apiClient from '../services/api';

const userAvatarSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="lightgray" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`;
const userAvatarDataUrl = `data:image/svg+xml;base64,${btoa(userAvatarSvg)}`;

type User = {
  id: number;
  email: string;
  role: 'superadmin' | 'admin' | 'gerant' | 'vendeur' | string;
  statut: string;
  photo_url?: string | null;
};

const UserPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formState, setFormState] = useState<Partial<User & { mot_de_passe?: string }>>({});
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiClient.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur chargement utilisateurs', err);
      showNotification('Erreur lors du chargement des utilisateurs', 'error');
    }
  };

  useEffect(() => {
    if (currentUser) {
      setFormState({
        email: currentUser.email ?? '',
        role: currentUser.role ?? 'vendeur',
        statut: currentUser.statut ?? 'actif',
        photo_url: currentUser.photo_url ?? userAvatarDataUrl,
        mot_de_passe: undefined,
      });
    } else {
      setFormState({
        email: '',
        role: 'vendeur',
        statut: 'actif',
        photo_url: userAvatarDataUrl,
        mot_de_passe: undefined,
      });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState((s) => ({ ...s, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormState((s) => ({ ...s, photo_url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation minimale
    if (!formState.email || formState.email.toString().trim() === '') {
      showNotification('L\'email est requis', 'error');
      setLoading(false);
      return;
    }
    if (!currentUser && (!formState.mot_de_passe || formState.mot_de_passe.trim() === '')) {
      showNotification('Le mot de passe est requis pour créer un utilisateur', 'error');
      setLoading(false);
      return;
    }

    const payload: any = {
      email: (formState.email || '').toString().trim().toLowerCase(),
      role: formState.role || 'vendeur',
      statut: formState.statut || 'actif',
      photo_url: formState.photo_url || null,
    };

    if (formState.mot_de_passe && formState.mot_de_passe.trim() !== '') {
      payload.mot_de_passe = formState.mot_de_passe;
    }

    try {
      if (currentUser && currentUser.id) {
        await apiClient.updateUser(currentUser.id, payload);
        showNotification('Utilisateur modifié avec succès', 'success');
      } else {
        await apiClient.createUser(payload);
        showNotification('Utilisateur créé avec succès', 'success');
      }
      await fetchUsers();
      handleCloseModals();
    } catch (err: any) {
      console.error(err);
      showNotification(err?.message || 'Erreur lors de l\'enregistrement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await apiClient.deleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      showNotification('Utilisateur supprimé', 'success');
      handleCloseModals();
    } catch (err) {
      console.error(err);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Gestion des Utilisateurs</h1>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
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
                <th className="py-3 px-4 font-medium text-gray-500">Statut</th>
                <th className="py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => {
                  const displayName = user.email.split('@')[0];
                  return (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-4">
                        <img
                          src={user.photo_url || userAvatarDataUrl}
                          alt={displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="py-3 px-4 font-semibold">{displayName}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{user.role}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.statut}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <TableActions onEdit={() => handleOpenEditModal(user)} onDelete={() => handleOpenDeleteModal(user)} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Aucun utilisateur trouvé.
                  </td>
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
                <img src={formState.photo_url || userAvatarDataUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover bg-gray-100" />
                <label htmlFor="photo-upload" className="cursor-pointer px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                  <span>Changer</span>
                  <input id="photo-upload" name="photo" type="file" className="sr-only" onChange={handlePhotoChange} accept="image/*" />
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formState.email ?? ''}
                onChange={handleChange}
                required
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="mot_de_passe" className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                type="password"
                name="mot_de_passe"
                id="mot_de_passe"
                value={formState.mot_de_passe ?? ''}
                onChange={(e) => setFormState((s) => ({ ...s, mot_de_passe: e.target.value }))}
                placeholder={currentUser ? 'Laisser vide pour ne pas changer' : ''}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rôle</label>
              <select
                id="role"
                name="role"
                value={formState.role ?? 'vendeur'}
                onChange={handleChange}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="superadmin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="gerant">Gérant</option>
                <option value="vendeur">Vendeur</option>
              </select>
            </div>

            <div>
              <label htmlFor="statut" className="block text-sm font-medium text-gray-700">Statut</label>
              <select
                id="statut"
                name="statut"
                value={formState.statut ?? 'actif'}
                onChange={handleChange}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="bloque">Bloqué</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <button type="button" onClick={handleCloseModals} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-700 border border-transparent rounded-md shadow-sm hover:bg-blue-800">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleDeleteConfirm}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userToDelete?.email ?? ''}" ?`}
      />
    </div>
  );
};

export default UserPage;
