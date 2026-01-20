import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import TableActions from './TableActions';
import { useNotification } from '../hooks/useNotification';
import apiClient, { StaffMember } from '../services/api';

// Avatar par défaut si aucune photo n'est présente
const userAvatarSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="lightgray" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`;
const userAvatarDataUrl = `data:image/svg+xml;base64,${btoa(userAvatarSvg)}`;

const StaffPage: React.FC = () => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [stores, setStores] = useState<{id: number, nom_magasin: string}[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentMember, setCurrentMember] = useState<Partial<StaffMember> | null>(null);
    const [memberToDelete, setMemberToDelete] = useState<StaffMember | null>(null);
    const [formState, setFormState] = useState<Partial<StaffMember>>({});
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();

    // 1. Charger les données au montage
    useEffect(() => {
        fetchStaff();
        fetchStores();
    }, []);

    const fetchStaff = async () => {
        try {
            const data = await apiClient.getStaff();
            setStaff(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur chargement personnel:', error);
            showNotification('Erreur lors du chargement du personnel', 'error');
        }
    };

    const fetchStores = async () => {
        try {
            const data = await apiClient.getMagasins();
            setStores(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur chargement magasins:', error);
            showNotification('Impossible de charger les magasins', 'error');
        }
    };

    useEffect(() => {
        if (currentMember) {
            setFormState(currentMember);
        } else {
            setFormState({ statut: 'actif', poste: 'vendeur', photo_url: userAvatarDataUrl });
        }
    }, [currentMember]);

    const handleOpenAddModal = () => {
        setCurrentMember(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (member: StaffMember) => {
        setCurrentMember(member);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (member: StaffMember) => {
        setMemberToDelete(member);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setCurrentMember(null);
        setMemberToDelete(null);
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (currentMember?.identifiant) {
                await apiClient.updateStaff(currentMember.identifiant, formState);
                showNotification('Membre modifié avec succès !', 'success');
            } else {
                await apiClient.createStaff(formState);
                showNotification('Membre ajouté avec succès !', 'success');
            }
            fetchStaff();
            handleCloseModals();
        } catch (error) {
            showNotification('Une erreur est survenue', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (memberToDelete) {
            try {
                await apiClient.deleteStaff(memberToDelete.identifiant);
                setStaff(staff.filter(m => m.identifiant !== memberToDelete.identifiant));
                showNotification('Membre supprimé !', 'success');
                handleCloseModals();
            } catch (error) {
                showNotification('Erreur lors de la suppression', 'error');
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let next: any = value;
        if (name === 'salaire_base') {
            next = value === '' ? undefined : Number(value);
        } else if (name === 'id_magasin') {
            next = value === '' ? null : Number(value);
        }
        setFormState({ ...formState, [name]: next });
    };
    
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormState({ ...formState, photo_url: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Gestion du Personnel</h1>
                <button onClick={handleOpenAddModal} className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors">
                    + Ajouter un membre
                </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 font-medium text-gray-500">Photo</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Nom</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Prenom</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Poste</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Magasin</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Téléphone</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Statut</th>
                                <th className="py-3 px-4 font-medium text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                             {staff.length > 0 ? staff.map(member => (
                                <tr key={member.identifiant} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="py-2 px-4">
                                        <img src={member.photo_url || userAvatarDataUrl} alt="Profil" className="w-10 h-10 rounded-full object-cover border border-gray-200"/>
                                    </td>
                                    <td className="py-3 px-4 font-medium text-gray-900">{member.nom}</td>
                                    <td className="py-3 px-4 text-gray-600 capitalize">{member.prenom}</td>
                                    <td className="py-3 px-4 text-gray-600 capitalize">{member.poste}</td>
                                    <td className="py-3 px-4 text-gray-600">
                                        {stores.find(s => s.id === member.id_magasin)?.nom_magasin || 'Non affecté'}
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">{member.telephone}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${member.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {member.statut}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <TableActions
                                            onEdit={() => handleOpenEditModal(member)}
                                            onDelete={() => handleOpenDeleteModal(member)}
                                        />
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-gray-500 italic">Aucun membre enregistré dans la base de données.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={handleCloseModals} 
                title={currentMember ? "Modifier Personnel" : "Nouveau Personnel"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col items-center mb-4">
                        <img 
                            src={formState.photo_url || userAvatarDataUrl} 
                            alt="Preview" 
                            className="w-20 h-20 rounded-full object-cover border-2 border-blue-100 mb-2"
                        />
                        <label className="cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-800">
                            CHANGER LA PHOTO
                            <input type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase">Nom</label>
                            <input type="text" name="nom" value={formState.nom || ''} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase">Prénom</label>
                            <input type="text" name="prenom" value={formState.prenom || ''} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase">Poste</label>
                            <select name="poste" value={formState.poste || 'vendeur'} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md outline-none">
                                <option value="vendeur">Vendeur</option>
                                <option value="caissier">Caissier</option>
                                <option value="gerant">Gérant</option>
                                <option value="stockiste">Stockiste</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase">Téléphone</label>
                            <input type="tel" name="telephone" value={formState.telephone || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase">Salaire Base</label>
                            <input type="number" name="salaire_base" value={formState.salaire_base || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase">Magasin</label>
                            <select name="id_magasin" value={formState.id_magasin || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md outline-none">
                                <option value="">Choisir un magasin</option>
                                {stores.map(s => <option key={s.id} value={s.id}>{s.nom_magasin}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={handleCloseModals} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Annuler</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:opacity-50">
                            {loading ? 'Chargement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </Modal>
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                onConfirm={handleDeleteConfirm}
                title="Supprimer ce membre ?"
                message={`Cette action est irréversible pour ${memberToDelete?.prenom} ${memberToDelete?.nom}.`}
            />
        </div>
    );
};

export default StaffPage;