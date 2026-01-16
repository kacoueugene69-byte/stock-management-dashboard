
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import TableActions from './TableActions';
import { useNotification } from '../hooks/useNotification';

const userAvatarSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="lightgray" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`;
const userAvatarDataUrl = `data:image/svg+xml;base64,${btoa(userAvatarSvg)}`;

// This would normally come from a central data source or API
const storesData: { id: number, nom_magasin: string }[] = [];

type StaffMember = { 
    id: number;
    matricule: string;
    nom: string;
    prenom: string;
    poste: string;
    telephone: string;
    id_magasin: number;
    statut: string;
    salaire_base: number;
    photoUrl: string;
};

const StaffPage: React.FC = () => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentMember, setCurrentMember] = useState<Partial<StaffMember> | null>(null);
    const [memberToDelete, setMemberToDelete] = useState<StaffMember | null>(null);
    const [formState, setFormState] = useState<Partial<StaffMember>>({});
    const { showNotification } = useNotification();

    useEffect(() => {
        if (currentMember) {
            setFormState(currentMember);
        } else {
            setFormState({ statut: 'actif', poste: 'vendeur', photoUrl: userAvatarDataUrl });
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
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentMember?.id) {
            setStaff(staff.map(m => m.id === currentMember.id ? { ...m, ...formState, id: m.id } as StaffMember : m));
            showNotification('Membre du personnel modifié avec succès !', 'success');
        } else {
            const newMember = { ...formState, id: Date.now(), matricule: `PER${Date.now().toString().slice(-4)}` } as StaffMember;
            setStaff([...staff, newMember]);
            showNotification('Membre du personnel ajouté avec succès !', 'success');
        }
        handleCloseModals();
    };

    const handleDeleteConfirm = () => {
        if (memberToDelete) {
            setStaff(staff.filter(m => m.id !== memberToDelete.id));
            showNotification('Membre du personnel supprimé avec succès !', 'success');
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
                <h1 className="text-xl font-semibold text-gray-800">Gestion du Personnel</h1>
                <button onClick={handleOpenAddModal} className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Ajouter un membre
                </button>
            </div>

            <div className="p-6 bg-white rounded-xl shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 font-medium text-gray-500">Photo</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Matricule</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Nom Complet</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Poste</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Magasin</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Téléphone</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Salaire</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Statut</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                             {staff.length > 0 ? staff.map(member => {
                                const store = storesData.find(s => s.id === member.id_magasin);
                                return (
                                <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-2 px-4">
                                        <img src={member.photoUrl} alt={`${member.prenom} ${member.nom}`} className="w-10 h-10 rounded-full object-cover"/>
                                    </td>
                                    <td className="py-3 px-4">{member.matricule}</td>
                                    <td className="py-3 px-4 font-semibold">{`${member.prenom} ${member.nom}`}</td>
                                    <td className="py-3 px-4">{member.poste}</td>
                                    <td className="py-3 px-4">{store ? store.nom_magasin : 'N/A'}</td>
                                    <td className="py-3 px-4">{member.telephone}</td>
                                    <td className="py-3 px-4">{member.salaire_base ? `${member.salaire_base.toLocaleString('fr-FR')} F` : 'N/A'}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${member.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {member.statut}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <TableActions
                                            onEdit={() => handleOpenEditModal(member)}
                                            onDelete={() => handleOpenDeleteModal(member)}
                                        />
                                    </td>
                                </tr>
                            )}) : (
                                <tr>
                                    <td colSpan={9} className="py-8 text-center text-gray-500">Aucun membre du personnel trouvé.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModals} title={currentMember ? "Modifier le membre du personnel" : "Ajouter un nouveau membre du personnel"}>
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
                            <label htmlFor="matricule" className="block text-sm font-medium text-gray-700">Matricule</label>
                            <input type="text" name="matricule" id="matricule" value={formState.matricule || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
                            <input type="text" name="nom" id="nom" value={formState.nom || ''} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">Prénom</label>
                            <input type="text" name="prenom" id="prenom" value={formState.prenom || ''} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                         <div>
                            <label htmlFor="poste" className="block text-sm font-medium text-gray-700">Poste</label>
                            <select id="poste" name="poste" value={formState.poste || 'vendeur'} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="gerant">Gérant</option>
                                <option value="vendeur">Vendeur</option>
                                <option value="caissier">Caissier</option>
                                <option value="stocker">Stocker</option>
                                <option value="admin">Admin</option>
                            </select>
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
                            <label htmlFor="date_embauche" className="block text-sm font-medium text-gray-700">Date d'embauche</label>
                            <input type="date" name="date_embauche" id="date_embauche" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="salaire_base" className="block text-sm font-medium text-gray-700">Salaire de Base</label>
                            <input type="number" name="salaire_base" id="salaire_base" value={formState.salaire_base || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="id_magasin" className="block text-sm font-medium text-gray-700">Magasin d'affectation</label>
                            <select id="id_magasin" name="id_magasin" value={formState.id_magasin || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                               <option>Sélectionner un magasin</option>
                               {storesData.map(store => <option key={store.id} value={store.id}>{store.nom_magasin}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="statut" className="block text-sm font-medium text-gray-700">Statut</label>
                            <select id="statut" name="statut" value={formState.statut || 'actif'} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="actif">Actif</option>
                                <option value="inactif">Inactif</option>
                                <option value="congé">En Congé</option>
                                <option value="licencié">Licencié</option>
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
                message={`Êtes-vous sûr de vouloir supprimer le membre ${memberToDelete?.prenom} ${memberToDelete?.nom} ?`}
            />
        </div>
    );
};

export default StaffPage;