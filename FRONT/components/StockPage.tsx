
import React, { useState } from 'react';
import Modal from './Modal';
import TableActions from './TableActions';
import ConfirmationModal from './ConfirmationModal';
import { useNotification } from '../hooks/useNotification';

// These would normally come from a central data source or API
const products: { id: number, name: string }[] = [];
const stores: { id: number, name: string }[] = [];

type StockStatus = {
  id: number;
  productId: number;
  productName: string;
  storeId: number;
  storeName: string;
  remainingQuantity: number;
  alertThreshold: number;
};

type StockMovement = {
    id: number;
    date: string;
    productId: number;
    storeId: number;
    type: 'entrée' | 'sortie';
    quantity: number;
    reason: string;
    productName?: string;
    storeName?: string;
};

const StockPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('status'); // 'status' or 'movements'
    const [stockStatus, setStockStatus] = useState<StockStatus[]>([]);
    const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
    
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [formState, setFormState] = useState<Partial<StockMovement>>({});
    const { showNotification } = useNotification();


    const getStatusChip = (item: StockStatus) => {
        const { remainingQuantity, alertThreshold } = item;
        if (remainingQuantity <= 0) {
            return <span className="px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded-full">Rupture</span>;
        }
        if (remainingQuantity < alertThreshold) {
            return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">Stock faible</span>;
        }
        return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">En Stock</span>;
    };

    const handleOpenMovementModal = () => {
        setFormState({
            date: new Date().toISOString().split('T')[0],
            type: 'entrée',
            quantity: 1
        });
        setIsMovementModalOpen(true);
    };

    const handleCloseMovementModal = () => {
        setIsMovementModalOpen(false);
        setFormState({});
    };

    const handleMovementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleMovementSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const product = products.find(p => p.id === Number(formState.productId));
        const store = stores.find(s => s.id === Number(formState.storeId));

        if (!product || !store) {
            alert("Veuillez sélectionner un article et un magasin valides.");
            return;
        }

        const newMovement: StockMovement = {
            id: Date.now(),
            date: formState.date || new Date().toISOString().split('T')[0],
            productId: Number(formState.productId),
            productName: product.name,
            storeId: Number(formState.storeId),
            storeName: store.name,
            type: formState.type as 'entrée' | 'sortie',
            quantity: Number(formState.quantity),
            reason: formState.reason || '',
        };
        setStockMovements([newMovement, ...stockMovements]);
        showNotification('Mouvement de stock ajouté avec succès !', 'success');
        // Here you would also update the stock status, but with mock data this is complex.
        // For this demo, we just add the movement to the list.
        handleCloseMovementModal();
    };


    const TabButton: React.FC<{ label: string; tabName: string; }> = ({ label, tabName }) => {
        const isActive = activeTab === tabName;
        return (
            <button
                onClick={() => setActiveTab(tabName)}
                className={`px-3 py-2 font-medium text-sm rounded-md ${
                    isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                {label}
            </button>
        );
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Gestion des Stocks</h1>
                {activeTab === 'movements' && (
                    <button onClick={handleOpenMovementModal} className="mt-4 sm:mt-0 px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Ajouter un mouvement
                    </button>
                )}
            </div>

            <div className="mb-6">
                <div className="sm:border-b sm:border-gray-200">
                    <nav className="flex space-x-2 sm:space-x-4" aria-label="Tabs">
                        <TabButton label="État des Stocks" tabName="status" />
                        <TabButton label="Mouvements de Stock" tabName="movements" />
                    </nav>
                </div>
            </div>

            {activeTab === 'status' && (
                <div className="p-6 bg-white rounded-xl shadow">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-3 px-4 font-medium text-gray-500">Article</th>
                                    <th className="py-3 px-4 font-medium text-gray-500">Magasin</th>
                                    <th className="py-3 px-4 font-medium text-gray-500 text-right">Quantité Restante</th>
                                    <th className="py-3 px-4 font-medium text-gray-500 text-right">Seuil d'Alerte</th>
                                    <th className="py-3 px-4 font-medium text-gray-500 text-center">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockStatus.length > 0 ? stockStatus.map(item => (
                                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-semibold">{item.productName}</td>
                                        <td className="py-3 px-4">{item.storeName}</td>
                                        <td className="py-3 px-4 font-bold text-right">{item.remainingQuantity}</td>
                                        <td className="py-3 px-4 text-right">{item.alertThreshold}</td>
                                        <td className="py-3 px-4 text-center">
                                            {getStatusChip(item)}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-500">Aucune donnée de stock trouvée.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

             {activeTab === 'movements' && (
                <div className="p-6 bg-white rounded-xl shadow">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-3 px-4 font-medium text-gray-500">Date</th>
                                    <th className="py-3 px-4 font-medium text-gray-500">Article</th>
                                    <th className="py-3 px-4 font-medium text-gray-500">Magasin</th>
                                    <th className="py-3 px-4 font-medium text-gray-500 text-center">Type</th>
                                    <th className="py-3 px-4 font-medium text-gray-500 text-right">Quantité</th>
                                    <th className="py-3 px-4 font-medium text-gray-500">Raison</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockMovements.length > 0 ? stockMovements.map(mov => (
                                    <tr key={mov.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm">{mov.date}</td>
                                        <td className="py-3 px-4 font-semibold">{mov.productName}</td>
                                        <td className="py-3 px-4">{mov.storeName}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${mov.type === 'entrée' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {mov.type}
                                            </span>
                                        </td>
                                        <td className={`py-3 px-4 font-bold text-right ${mov.type === 'entrée' ? 'text-green-600' : 'text-red-600'}`}>
                                            {mov.type === 'entrée' ? '+' : '-'}{mov.quantity}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{mov.reason}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-gray-500">Aucun mouvement de stock trouvé.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal isOpen={isMovementModalOpen} onClose={handleCloseMovementModal} title="Ajouter un Mouvement de Stock">
                <form onSubmit={handleMovementSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                            <input type="date" name="date" id="date" value={formState.date || ''} onChange={handleMovementChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type de Mouvement</label>
                            <select id="type" name="type" value={formState.type || 'entrée'} onChange={handleMovementChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="entrée">Entrée</option>
                                <option value="sortie">Sortie</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="productId" className="block text-sm font-medium text-gray-700">Article</label>
                            <select id="productId" name="productId" value={formState.productId || ''} onChange={handleMovementChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="">Sélectionner un article</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="storeId" className="block text-sm font-medium text-gray-700">Magasin</label>
                            <select id="storeId" name="storeId" value={formState.storeId || ''} onChange={handleMovementChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="">Sélectionner un magasin</option>
                                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantité</label>
                            <input type="number" name="quantity" id="quantity" value={formState.quantity || 1} onChange={handleMovementChange} min="1" required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Raison / Notes</label>
                            <textarea id="reason" name="reason" rows={3} value={formState.reason || ''} onChange={handleMovementChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 space-x-4">
                        <button type="button" onClick={handleCloseMovementModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Annuler
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-700 border border-transparent rounded-md shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Enregistrer
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default StockPage;