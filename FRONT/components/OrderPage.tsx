
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import TableActions from './TableActions';
import { useNotification } from '../hooks/useNotification';
import { DeleteIcon } from './icons';

// These would normally come from a central data source or API
const productsData: { id: number; nom_article: string; prix_vente: number; statut: string; }[] = [];
const clientsData: { id: number; nom: string; prenom: string; }[] = [];

type OrderItem = {
    productId: number;
    nom_article: string;
    quantite: number;
    prix_unitaire: number;
};

type Order = {
    id: number;
    numero_commande: string;
    id_client: number;
    nom_client: string;
    date_commande: string;
    statut: 'en attente' | 'preparation' | 'livree' | 'annulee';
    items: OrderItem[];
    montant_total: number;
    montant_paye: number;
    statut_paiement: 'payé' | 'partiel' | 'impayé';
};

const OrderPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<Partial<Order> | null>(null);
    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
    const { showNotification } = useNotification();
    
    // Form state
    const [formState, setFormState] = useState<Partial<Order>>({});
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [itemQuantity, setItemQuantity] = useState<number>(1);

    // Recalculate total when items change
    useEffect(() => {
        const total = formState.items?.reduce((sum, item) => sum + item.quantite * item.prix_unitaire, 0) || 0;
        if (formState.montant_total !== total) {
            setFormState(prev => ({...prev, montant_total: total}));
        }
    }, [formState.items]);

    // Update payment status based on amount paid
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
        setCurrentOrder(null);
        setFormState({
            date_commande: new Date().toISOString().split('T')[0],
            items: [],
            montant_total: 0,
            montant_paye: 0,
            statut: 'en attente',
            statut_paiement: 'impayé',
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (order: Order) => {
        setCurrentOrder(order);
        setFormState(JSON.parse(JSON.stringify(order))); // Deep copy
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (order: Order) => {
        setOrderToDelete(order);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setCurrentOrder(null);
        setOrderToDelete(null);
        setSelectedProductId('');
        setItemQuantity(1);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

        const newItem: OrderItem = {
            productId: product.id,
            nom_article: product.nom_article,
            quantite: itemQuantity,
            prix_unitaire: product.prix_vente,
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
            alert("Veuillez ajouter au moins un article à la commande.");
            return;
        }
        
        const client = clientsData.find(c => c.id === Number(formState.id_client));
        const finalFormState = {
            ...formState,
            nom_client: client ? `${client.prenom} ${client.nom}` : 'Client Inconnu'
        };

        if (currentOrder?.id) {
            setOrders(orders.map(o => o.id === currentOrder.id ? finalFormState as Order : o));
            showNotification('Commande modifiée avec succès !', 'success');
        } else {
            const newOrder = { 
                ...finalFormState, 
                id: Date.now(),
                numero_commande: `CMD-${Date.now().toString().slice(-6)}`,
             } as Order;
            setOrders([newOrder, ...orders]);
            showNotification('Commande ajoutée avec succès !', 'success');
        }
        handleCloseModals();
    };
    
    const handleDeleteConfirm = () => {
        if (orderToDelete) {
            setOrders(orders.filter(o => o.id !== orderToDelete.id));
            showNotification('Commande supprimée avec succès !', 'success');
            handleCloseModals();
        }
    };
    
    const getStatusChip = (status: Order['statut']) => {
        switch (status) {
            case 'livree': return 'bg-green-100 text-green-800';
            case 'en attente': return 'bg-yellow-100 text-yellow-800';
            case 'preparation': return 'bg-blue-100 text-blue-800';
            case 'annulee': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    const getPaymentStatusChip = (status: Order['statut_paiement']) => {
        switch (status) {
            case 'payé': return 'bg-green-100 text-green-800';
            case 'partiel': return 'bg-yellow-100 text-yellow-800';
            case 'impayé': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }


    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Gestion des Commandes</h1>
                <button onClick={handleOpenAddModal} className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Ajouter une commande
                </button>
            </div>

            <div className="p-6 bg-white rounded-xl shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 font-medium text-gray-500">N° Commande</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Client</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Date</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Statut</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Montant Total</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Montant Payé</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Reste à Payer</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Statut Paiement</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                             {orders.length > 0 ? orders.map(order => {
                                const resteAPayer = order.montant_total - order.montant_paye;
                                return (
                                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-semibold">{order.numero_commande}</td>
                                    <td className="py-3 px-4">{order.nom_client}</td>
                                    <td className="py-3 px-4">{order.date_commande}</td>
                                    <td className="py-3 px-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusChip(order.statut)}`}>{order.statut}</span></td>
                                    <td className="py-3 px-4 font-semibold">{order.montant_total.toLocaleString('fr-FR')} F</td>
                                    <td className="py-3 px-4 text-green-600">{order.montant_paye.toLocaleString('fr-FR')} F</td>
                                    <td className={`py-3 px-4 font-bold ${resteAPayer > 0 ? 'text-red-600' : 'text-gray-800'}`}>{resteAPayer.toLocaleString('fr-FR')} F</td>
                                    <td className="py-3 px-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getPaymentStatusChip(order.statut_paiement)}`}>{order.statut_paiement}</span></td>
                                    <td className="py-3 px-4">
                                        <TableActions 
                                            onEdit={() => handleOpenEditModal(order)}
                                            onDelete={() => handleOpenDeleteModal(order)}
                                        />
                                    </td>
                                </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan={9} className="py-8 text-center text-gray-500">Aucune commande trouvée.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModals} title={currentOrder ? "Modifier la commande" : "Ajouter une nouvelle commande"}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                         <div>
                            <label htmlFor="id_client" className="block text-sm font-medium text-gray-700">Client</label>
                            <select id="id_client" name="id_client" value={formState.id_client || ''} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="">Sélectionner un client</option>
                                {clientsData.map(c => <option key={c.id} value={c.id}>{`${c.prenom} ${c.nom}`}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="date_commande" className="block text-sm font-medium text-gray-700">Date Commande</label>
                            <input type="date" name="date_commande" id="date_commande" value={formState.date_commande || ''} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="statut" className="block text-sm font-medium text-gray-700">Statut de la Commande</label>
                            <select id="statut" name="statut" value={formState.statut || 'en attente'} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="en attente">En attente</option>
                                <option value="preparation">Préparation</option>
                                <option value="livree">Livrée</option>
                                <option value="annulee">Annulée</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="text-lg font-medium text-gray-900">Articles de la commande</h3>
                         <div className="grid grid-cols-12 gap-4 items-end mt-4">
                            <div className="col-span-12 sm:col-span-6">
                                <label htmlFor="article" className="block text-sm font-medium text-gray-700">Article</label>
                                <select id="article" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                    <option value="">Sélectionner un article</option>
                                    {productsData.filter(p => p.statut === 'actif').map(p => <option key={p.id} value={p.id}>{p.nom_article}</option>)}
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
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-800">{item.nom_article}</p>
                                        <p className="text-gray-500">{item.quantite} x {item.prix_unitaire.toLocaleString('fr-FR')} F</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <p className="text-sm font-semibold text-gray-900">{(item.quantite * item.prix_unitaire).toLocaleString('fr-FR')} F</p>
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
                        <h3 className="text-lg font-medium text-gray-900">Détails Financiers</h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mt-4">
                             <div>
                                <label htmlFor="montant_total" className="block text-sm font-medium text-gray-700">Montant Total</label>
                                <input type="text" name="montant_total" id="montant_total" value={`${(formState.montant_total || 0).toLocaleString('fr-FR')} F`} readOnly className="block w-full mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                            </div>
                             <div>
                                <label htmlFor="montant_paye" className="block text-sm font-medium text-gray-700">Montant Payé</label>
                                <input type="number" step="1" name="montant_paye" id="montant_paye" value={formState.montant_paye || 0} onChange={handleChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reste à Payer</label>
                                <input type="text" value={`${((formState.montant_total || 0) - (formState.montant_paye || 0)).toLocaleString('fr-FR')} F`} readOnly className="block w-full mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm sm:text-sm" />
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
                message={`Êtes-vous sûr de vouloir supprimer la commande ${orderToDelete?.numero_commande} ? Cette action est irréversible.`}
            />
        </div>
    );
};

export default OrderPage;