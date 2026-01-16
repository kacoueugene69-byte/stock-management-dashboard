
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import TableActions from './TableActions';
import { DeleteIcon, ProductIcon } from './icons';
import { useNotification } from '../hooks/useNotification';

// This would normally come from a central data source or API
const productsData: { id: number; nom_article: string; prix_vente: number; statut: string; }[] = [];

type SaleItem = {
    productId: number;
    nom_article: string;
    quantite: number;
    prix_vente: number;
};

type Sale = {
    id: number;
    date_vente: string;
    id_magasin: number;
    nom_client: string;
    items: SaleItem[];
    montant_total: number;
    montant_paye: number;
    mode_paiement: string;
    statut_paiement: 'payé' | 'partiel' | 'impayé';
    nom_vendeur: string;
};

const SalesPage: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentSale, setCurrentSale] = useState<Partial<Sale> | null>(null);
    const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
    const { showNotification } = useNotification();
    
    // Form state for new/editing sale
    const [formState, setFormState] = useState<Partial<Sale>>({});
    
    // State for the item being added
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [itemQuantity, setItemQuantity] = useState<number>(1);

    useEffect(() => {
        const total = formState.items?.reduce((sum, item) => sum + item.quantite * item.prix_vente, 0) || 0;
        if (formState.montant_total !== total) {
            setFormState(prev => ({...prev, montant_total: total}));
        }
    }, [formState.items]);

    useEffect(() => {
        const total = formState.montant_total || 0;
        const paid = formState.montant_paye || 0;
        let newStatus: 'payé' | 'partiel' | 'impayé' = 'impayé';
        if (paid <= 0) {
            newStatus = 'impayé';
        } else if (paid >= total && total > 0) {
            newStatus = 'payé';
        } else if (paid > 0 && paid < total) {
            newStatus = 'partiel';
        }
        if (formState.statut_paiement !== newStatus) {
            setFormState(prev => ({ ...prev, statut_paiement: newStatus }));
        }
    }, [formState.montant_paye, formState.montant_total]);


    const handleOpenAddModal = () => {
        setCurrentSale(null);
        setFormState({
            date_vente: new Date().toISOString().split('T')[0],
            items: [],
            montant_total: 0,
            montant_paye: 0,
            mode_paiement: 'espèces',
            statut_paiement: 'impayé',
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (sale: Sale) => {
        setCurrentSale(sale);
        setFormState(JSON.parse(JSON.stringify(sale))); // Deep copy to prevent mutation
        setIsModalOpen(true);
    };
    
    const handleOpenDeleteModal = (sale: Sale) => {
        setSaleToDelete(sale);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setCurrentSale(null);
        setSaleToDelete(null);
        setSelectedProductId('');
        setItemQuantity(1);
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ 
            ...prev, 
            [name]: name === 'montant_paye' ? parseFloat(value) || 0 : value
        }));
    };

    const handleAddItem = () => {
        if (!selectedProductId || itemQuantity <= 0) {
            alert("Veuillez sélectionner un produit et une quantité valide.");
            return;
        }
        const product = productsData.find(p => p.id === parseInt(selectedProductId));
        if (!product) {
            alert("Produit non trouvé.");
            return;
        }

        const newItem: SaleItem = {
            productId: product.id,
            nom_article: product.nom_article,
            quantite: itemQuantity,
            prix_vente: product.prix_vente,
        };
        
        const currentItems = formState.items || [];
        const existingItemIndex = currentItems.findIndex(item => item.productId === newItem.productId);
        let updatedItems;

        if (existingItemIndex > -1) {
            updatedItems = [...currentItems];
            updatedItems[existingItemIndex].quantite += newItem.quantite;
        } else {
            updatedItems = [...currentItems, newItem];
        }

        setFormState({ ...formState, items: updatedItems });
        setSelectedProductId('');
        setItemQuantity(1);
    };
    
    const handleRemoveItem = (productId: number) => {
        const updatedItems = formState.items?.filter(item => item.productId !== productId);
        setFormState({ ...formState, items: updatedItems });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((formState.items?.length || 0) === 0) {
            alert("Veuillez ajouter au moins un article à la vente.");
            return;
        }
        if (currentSale?.id) {
            setSales(sales.map(s => s.id === currentSale.id ? formState as Sale : s));
            showNotification('Vente modifiée avec succès !', 'success');
        } else {
            const newSale = { ...formState, id: Date.now() } as Sale;
            setSales([newSale, ...sales]);
            showNotification('Vente ajoutée avec succès !', 'success');
        }
        handleCloseModals();
    };

    const handleDeleteConfirm = () => {
        if (saleToDelete) {
            setSales(sales.filter(s => s.id !== saleToDelete.id));
            showNotification('Vente supprimée avec succès !', 'success');
            handleCloseModals();
        }
    };

    const getPaymentStatusChip = (status: Sale['statut_paiement']) => {
        switch (status) {
            case 'payé': return 'bg-green-100 text-green-800';
            case 'partiel': return 'bg-yellow-100 text-yellow-800';
            case 'impayé': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Gestion des Ventes</h1>
                <button onClick={handleOpenAddModal} className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Ajouter une vente
                </button>
            </div>

            <div className="p-6 bg-white rounded-xl shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 font-medium text-gray-500">Date</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Client</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Article(s)</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Montant Total</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Montant Payé</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Reste à Payer</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Statut Paiement</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                             {sales.length > 0 ? sales.map(sale => {
                                const articleDetails = sale.items
                                    .map(item => `${item.nom_article} (x${item.quantite})`)
                                    .join(', ');
                                const resteAPayer = sale.montant_total - sale.montant_paye;
                                return (
                                <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4">{sale.date_vente}</td>
                                    <td className="py-3 px-4 font-semibold">{sale.nom_client}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate" title={articleDetails}>
                                        {articleDetails}
                                    </td>
                                    <td className="py-3 px-4">{sale.montant_total.toLocaleString('fr-FR')} F</td>
                                    <td className="py-3 px-4 text-green-600">{sale.montant_paye.toLocaleString('fr-FR')} F</td>
                                     <td className={`py-3 px-4 font-bold ${resteAPayer > 0 ? 'text-red-600' : 'text-gray-800'}`}>{resteAPayer.toLocaleString('fr-FR')} F</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getPaymentStatusChip(sale.statut_paiement)}`}>
                                            {sale.statut_paiement}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <TableActions 
                                            onEdit={() => handleOpenEditModal(sale)}
                                            onDelete={() => handleOpenDeleteModal(sale)}
                                        />
                                    </td>
                                </tr>
                                )
                             }) : (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-gray-500">Aucune vente trouvée.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModals} title={currentSale ? "Modifier la vente" : "Enregistrer une nouvelle vente"}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="id_magasin" className="block text-sm font-medium text-gray-700">Magasin</label>
                            <select id="id_magasin" name="id_magasin" value={formState.id_magasin || ''} onChange={handleFormChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                               <option>Sélectionner un magasin</option>
                               <option value="1">CDCOM Abidjan</option>
                               <option value="2">CDCOM Bouaké</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="nom_vendeur" className="block text-sm font-medium text-gray-700">Nom du Vendeur</label>
                            <input type="text" name="nom_vendeur" id="nom_vendeur" value={formState.nom_vendeur || ''} onChange={handleFormChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="nom_client" className="block text-sm font-medium text-gray-700">Nom du Client</label>
                            <input type="text" name="nom_client" id="nom_client" value={formState.nom_client || ''} onChange={handleFormChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="date_vente" className="block text-sm font-medium text-gray-700">Date de vente</label>
                            <input type="date" name="date_vente" id="date_vente" value={formState.date_vente || ''} onChange={handleFormChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                        <h3 className="text-lg font-medium text-gray-900">Articles</h3>
                         <div className="grid grid-cols-12 gap-4 items-end mt-4">
                            <div className="col-span-12 sm:col-span-6">
                                <label htmlFor="article" className="block text-sm font-medium text-gray-700">Article</label>
                                <select id="article" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                    <option value="">Sélectionner un article</option>
                                    {productsData.filter(p=>p.statut !== 'inactif').map(p => <option key={p.id} value={p.id}>{p.nom_article}</option>)}
                                </select>
                            </div>
                            <div className="col-span-6 sm:col-span-3">
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantité</label>
                                <input type="number" id="quantity" value={itemQuantity} onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)} min="1" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                            <div className="col-span-6 sm:col-span-3">
                                <button type="button" onClick={handleAddItem} className="justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    Ajouter
                                </button>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2">
                            {formState.items?.map(item => (
                                <div key={item.productId} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 flex items-center justify-center rounded-md bg-gray-100 text-gray-400 flex-shrink-0">
                                            <ProductIcon className="w-5 h-5" />
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-800">{item.nom_article}</p>
                                            <p className="text-gray-500">{item.quantite} x {item.prix_vente.toLocaleString('fr-FR')} F</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <p className="text-sm font-semibold text-gray-900">{(item.quantite * item.prix_vente).toLocaleString('fr-FR')} F</p>
                                        <button type="button" onClick={() => handleRemoveItem(item.productId)} className="p-1 text-red-500 rounded-full hover:bg-red-100">
                                            <DeleteIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {(!formState.items || formState.items.length === 0) && (
                                <p className="text-sm text-center text-gray-500 py-4">Aucun article ajouté.</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="text-lg font-medium text-gray-900">Paiement</h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mt-4 items-center">
                            <div>
                                <label htmlFor="montant_total" className="block text-sm font-medium text-gray-700">Montant Total</label>
                                <input type="text" name="montant_total" id="montant_total" value={`${(formState.montant_total || 0).toLocaleString('fr-FR')} F`} readOnly className="block w-full mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="montant_paye" className="block text-sm font-medium text-gray-700">Montant Payé (Avance)</label>
                                <input type="number" step="1" name="montant_paye" id="montant_paye" value={formState.montant_paye ?? 0} onChange={handleFormChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="reste_a_payer" className="block text-sm font-medium text-gray-700">Reste à Payer</label>
                                <input type="text" name="reste_a_payer" id="reste_a_payer" value={`${((formState.montant_total || 0) - (formState.montant_paye || 0)).toLocaleString('fr-FR')} F`} readOnly className="block w-full mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="mode_paiement" className="block text-sm font-medium text-gray-700">Mode de Paiement</label>
                                <select id="mode_paiement" name="mode_paiement" value={formState.mode_paiement || 'espèces'} onChange={handleFormChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                    <option value="espèces">Espèces</option>
                                    <option value="carte">Carte</option>
                                    <option value="mobile">Mobile</option>
                                    <option value="virement">Virement</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Statut du Paiement</label>
                                <div className="mt-1 flex items-center">
                                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-full capitalize ${getPaymentStatusChip(formState.statut_paiement || 'impayé')}`}>
                                        {formState.statut_paiement || 'impayé'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-4 space-x-4">
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
                message={`Êtes-vous sûr de vouloir supprimer cette vente du ${saleToDelete?.date_vente} ?`}
            />
        </div>
    );
};

export default SalesPage;