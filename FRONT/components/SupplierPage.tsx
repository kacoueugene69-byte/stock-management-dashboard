
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import TableActions from './TableActions';
import { useNotification } from '../hooks/useNotification';

type Supplier = { 
    id: number;
    nom_fournisseur: string;
    contact_principal: string;
    telephone: string;
    email: string;
    adresse: string;
    ville: string;
    types_articles_fournis: string[];
    conditions_paiement: string;
    specialisation_fournisseur: string;
};

const SupplierPage: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState<Partial<Supplier> | null>(null);
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
    const [formState, setFormState] = useState<Partial<Supplier>>({});
    const { showNotification } = useNotification();

    const emptyFormState: Partial<Supplier> = {
        nom_fournisseur: '',
        contact_principal: '',
        telephone: '',
        email: '',
        adresse: '',
        ville: '',
        conditions_paiement: '',
        types_articles_fournis: [],
        specialisation_fournisseur: ''
    };

    useEffect(() => {
        if (currentSupplier) {
            setFormState(currentSupplier);
        } else {
            setFormState(emptyFormState);
        }
    }, [currentSupplier]);

    const handleOpenAddModal = () => {
        setCurrentSupplier(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (supplier: Supplier) => {
        setCurrentSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (supplier: Supplier) => {
        setSupplierToDelete(supplier);
        setIsDeleteModalOpen(true);
    };
    
    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setCurrentSupplier(null);
        setSupplierToDelete(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentSupplier?.id) {
            setSuppliers(suppliers.map(s => s.id === currentSupplier.id ? { ...s, ...formState } as Supplier : s));
            showNotification('Fournisseur modifié avec succès !', 'success');
        } else {
            const newSupplier = { ...formState, id: Date.now() } as Supplier;
            setSuppliers([...suppliers, newSupplier]);
            showNotification('Fournisseur ajouté avec succès !', 'success');
        }
        handleCloseModals();
    };

    const handleDeleteConfirm = () => {
        if (supplierToDelete) {
            setSuppliers(suppliers.filter(s => s.id !== supplierToDelete.id));
            showNotification('Fournisseur supprimé avec succès !', 'success');
            handleCloseModals();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        const currentTypes = formState.types_articles_fournis || [];
        if (checked) {
            setFormState({ ...formState, types_articles_fournis: [...currentTypes, value] });
        } else {
            setFormState({ ...formState, types_articles_fournis: currentTypes.filter(type => type !== value) });
        }
    };
    
    const articleTypes = ['Aliments', 'Médicaments', 'Équipements', 'Produits chimiques', 'Matériel d\'élevage', 'Autres'];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Gestion des Fournisseurs</h1>
                <button onClick={handleOpenAddModal} className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Ajouter un fournisseur
                </button>
            </div>

            <div className="p-6 bg-white rounded-xl shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 font-medium text-gray-500">Nom du Fournisseur</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Adresse</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Contact</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Articles Fournis</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.length > 0 ? suppliers.map(supplier => (
                                <tr key={supplier.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-semibold">{supplier.nom_fournisseur}</td>
                                    <td className="py-3 px-4">{supplier.adresse}</td>
                                    <td className="py-3 px-4">{supplier.telephone}</td>
                                    <td className="py-3 px-4">{supplier.types_articles_fournis.join(', ')}</td>
                                    <td className="py-3 px-4">
                                        <TableActions
                                            onEdit={() => handleOpenEditModal(supplier)}
                                            onDelete={() => handleOpenDeleteModal(supplier)}
                                        />
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">Aucun fournisseur trouvé.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModals} title={currentSupplier ? "Modifier le fournisseur" : "Ajouter un nouveau fournisseur"}>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="nom_fournisseur" className="block text-sm font-medium text-gray-700">Nom du Fournisseur</label>
                            <input type="text" name="nom_fournisseur" id="nom_fournisseur" value={formState.nom_fournisseur || ''} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="contact_principal" className="block text-sm font-medium text-gray-700">Contact Principal</label>
                            <input type="text" name="contact_principal" id="contact_principal" value={formState.contact_principal || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
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
                            <input type="text" name="adresse" id="adresse" value={formState.adresse || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="ville" className="block text-sm font-medium text-gray-700">Ville</label>
                            <input type="text" name="ville" id="ville" value={formState.ville || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="conditions_paiement" className="block text-sm font-medium text-gray-700">Conditions de Paiement</label>
                            <input type="text" name="conditions_paiement" id="conditions_paiement" value={formState.conditions_paiement || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Types d'articles fournis</label>
                            <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-3">
                                {articleTypes.map(type => (
                                    <div key={type} className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input 
                                                id={`type-${type}`} 
                                                name="types_articles_fournis" 
                                                type="checkbox" 
                                                value={type} 
                                                checked={formState.types_articles_fournis?.includes(type)}
                                                onChange={handleCheckboxChange}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor={`type-${type}`} className="font-medium text-gray-700">{type}</label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="specialisation_fournisseur" className="block text-sm font-medium text-gray-700">Spécialisation du Fournisseur</label>
                            <textarea id="specialisation_fournisseur" name="specialisation_fournisseur" rows={3} value={formState.specialisation_fournisseur || ''} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
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
                message={`Êtes-vous sûr de vouloir supprimer le fournisseur "${supplierToDelete?.nom_fournisseur}" ?`}
            />
        </div>
    );
};

export default SupplierPage;