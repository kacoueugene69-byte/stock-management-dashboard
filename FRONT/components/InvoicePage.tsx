
import React, { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';
import TableActions from './TableActions';
import { useNotification } from '../hooks/useNotification';
import Modal from './Modal';
import { DownloadIcon, PrintIcon } from './icons';
import Logo from './Logo';

// Mock Data for Sales (to retrieve invoice items)
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

// This would normally come from a central data source or API
const salesData: Sale[] = [];

type Invoice = {
    id: number;
    invoiceNumber: string;
    saleId: number;
    saleDate: string;
    clientName: string;
    totalAmount: number;
    status: 'payé' | 'partiel' | 'impayé';
};

const InvoicePage: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [invoiceToView, setInvoiceToView] = useState<Invoice | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
    const { showNotification } = useNotification();

    const handlePrint = () => {
        window.print();
    };

    const handleOpenDeleteModal = (invoice: Invoice) => {
        setInvoiceToDelete(invoice);
        setIsDeleteModalOpen(true);
    };

    const handleViewInvoice = (invoice: Invoice) => {
        setInvoiceToView(invoice);
        setIsViewModalOpen(true);
    };

    const handleOpenCreateModal = () => {
        setSelectedSaleId(null);
        setIsCreateModalOpen(true);
    };
    
    const handleCloseModals = () => {
        setIsDeleteModalOpen(false);
        setInvoiceToDelete(null);
        setIsViewModalOpen(false);
        setInvoiceToView(null);
        setIsCreateModalOpen(false);
        setSelectedSaleId(null);
    };

    const handleDeleteConfirm = () => {
        if (invoiceToDelete) {
            setInvoices(invoices.filter(inv => inv.id !== invoiceToDelete.id));
            showNotification(`Facture ${invoiceToDelete.invoiceNumber} supprimée.`, 'success');
            handleCloseModals();
        }
    };

    const handleCreateInvoice = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSaleId) {
            showNotification("Veuillez sélectionner une vente.", 'error');
            return;
        }

        const sale = salesData.find(s => s.id === selectedSaleId);
        if (!sale) {
            showNotification("Vente sélectionnée non trouvée.", 'error');
            return;
        }

        const newInvoice: Invoice = {
            id: Date.now(),
            invoiceNumber: `FACT-${Date.now().toString().slice(-6)}`,
            saleId: sale.id,
            saleDate: sale.date_vente,
            clientName: sale.nom_client,
            totalAmount: sale.montant_total,
            status: sale.statut_paiement,
        };

        setInvoices(prevInvoices => [newInvoice, ...prevInvoices]);
        showNotification(`Facture ${newInvoice.invoiceNumber} créée avec succès !`, 'success');
        handleCloseModals();
    };
    
    const getPaymentStatusChip = (status: Invoice['status']) => {
        switch (status) {
            case 'payé': return 'bg-green-100 text-green-800';
            case 'partiel': return 'bg-yellow-100 text-yellow-800';
            case 'impayé': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const InvoiceTemplate: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
        const sale = salesData.find(s => s.id === invoice.saleId);
        if (!sale) return <p>Détails de la vente non trouvés.</p>;

        const total = invoice.totalAmount;

        return (
            <div id="printable-invoice-content" className="text-gray-800 p-2 sm:p-4">
                {/* Header */}
                <div className="flex justify-between items-start pb-4 mb-4 border-b border-gray-200">
                    <Logo variant="dark-on-light" size="md" />
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-gray-800 uppercase">Facture</h2>
                        <p className="text-gray-500">{invoice.invoiceNumber}</p>
                    </div>
                </div>

                {/* Info Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div>
                        <p className="text-sm font-semibold text-gray-500">DE</p>
                        <p className="font-bold">CDCOM-FACI</p>
                        <p className="text-sm text-gray-600">Abidjan, Côte d'Ivoire</p>
                        <p className="text-sm text-gray-600">contact@cdcom-faci.com</p>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="text-sm font-semibold text-gray-500">FACTURÉ À</p>
                        <p className="font-bold">{invoice.clientName}</p>
                    </div>
                     <div className="text-left">
                        <p className="text-sm font-semibold text-gray-500">DATE DE FACTURATION</p>
                        <p className="font-medium">{invoice.saleDate}</p>
                    </div>
                    <div className="text-left sm:text-right">
                         <p className="text-sm font-semibold text-gray-500">STATUT</p>
                         <p className={`font-bold capitalize ${
                            invoice.status === 'payé' ? 'text-green-600' : 
                            invoice.status === 'partiel' ? 'text-yellow-600' : 'text-red-600'
                         }`}>
                           {invoice.status}
                        </p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left mb-6">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-4 font-semibold text-gray-600">Article</th>
                                <th className="py-2 px-4 font-semibold text-gray-600 text-center">Quantité</th>
                                <th className="py-2 px-4 font-semibold text-gray-600 text-right">Prix Unitaire</th>
                                <th className="py-2 px-4 font-semibold text-gray-600 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.items.map(item => (
                                <tr key={item.productId} className="border-b border-gray-100">
                                    <td className="py-3 px-4">{item.nom_article}</td>
                                    <td className="py-3 px-4 text-center">{item.quantite}</td>
                                    <td className="py-3 px-4 text-right">{item.prix_vente.toLocaleString('fr-FR')} F</td>
                                    <td className="py-3 px-4 text-right font-medium">{(item.quantite * item.prix_vente).toLocaleString('fr-FR')} F</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Totals */}
                <div className="flex justify-end mt-4">
                    <div className="w-full max-w-sm space-y-2 text-gray-700">
                        <div className="flex justify-between pt-2 mt-2 border-t-2 text-lg font-bold text-gray-900">
                            <span>Total:</span>
                            <span>{total.toLocaleString('fr-FR')} F</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                 <div className="mt-10 pt-4 border-t text-center text-xs text-gray-500 space-y-1">
                    <p>CDCOM-FACI : Aliments locaux, aliments FACI, produits vétérinaires et matériels d'élevage.</p>
                    <p>MERCI POUR VOTRE CONFIANCE. DIEU VOUS GARDE.</p>
                </div>
            </div>
        )
    };
    
    const salesWithoutInvoice = salesData.filter(sale => 
        !invoices.some(invoice => invoice.saleId === sale.id)
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Gestion des Factures</h1>
                <button onClick={handleOpenCreateModal} className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Créer une facture
                </button>
            </div>

            <div className="p-6 bg-white rounded-xl shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 font-medium text-gray-500">N° Facture</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Client</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Date</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Montant Total</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Statut</th>
                                <th className="py-3 px-4 font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                             {invoices.length > 0 ? invoices.map(invoice => (
                                <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-semibold">{invoice.invoiceNumber}</td>
                                    <td className="py-3 px-4">{invoice.clientName}</td>
                                    <td className="py-3 px-4">{invoice.saleDate}</td>
                                    <td className="py-3 px-4">{invoice.totalAmount.toLocaleString('fr-FR')} F</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getPaymentStatusChip(invoice.status)}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <TableActions
                                            onView={() => handleViewInvoice(invoice)}
                                            onDelete={() => handleOpenDeleteModal(invoice)}
                                        />
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500">Aucune facture trouvée.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                onConfirm={handleDeleteConfirm}
                title="Confirmer la suppression"
                message={`Êtes-vous sûr de vouloir supprimer la facture ${invoiceToDelete?.invoiceNumber} ? Cette action est irréversible.`}
            />
            
            <Modal isOpen={isViewModalOpen} onClose={handleCloseModals} title={`Détails de la Facture ${invoiceToView?.invoiceNumber || ''}`}>
                {invoiceToView && (
                    <>
                        <InvoiceTemplate 
                            invoice={invoiceToView} 
                        />
                         <div className="flex justify-end mt-6 space-x-4 px-6 pb-4 no-print">
                            <button type="button" onClick={handleCloseModals} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Fermer
                            </button>
                             <button type="button" onClick={handlePrint} className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <PrintIcon className="w-4 h-4 mr-2" />
                                Imprimer
                            </button>
                            <button type="button" onClick={handlePrint} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-700 border border-transparent rounded-md shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <DownloadIcon className="w-4 h-4 mr-2" />
                                Télécharger PDF
                            </button>
                        </div>
                    </>
                )}
            </Modal>
            
            <Modal isOpen={isCreateModalOpen} onClose={handleCloseModals} title="Créer une facture à partir d'une vente">
                <form onSubmit={handleCreateInvoice}>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">Sélectionnez une vente pour laquelle générer une facture. Seules les ventes sans facture existante sont affichées.</p>
                        <div className="max-h-80 overflow-y-auto border rounded-md p-2 space-y-2">
                            {salesWithoutInvoice.length > 0 ? (
                                salesWithoutInvoice.map(sale => (
                                    <div key={sale.id} className="flex items-center p-3 rounded-md hover:bg-gray-50 border border-gray-200 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300 transition-colors">
                                        <input
                                            type="radio"
                                            id={`sale-${sale.id}`}
                                            name="selectedSale"
                                            value={sale.id}
                                            checked={selectedSaleId === sale.id}
                                            onChange={() => setSelectedSaleId(sale.id)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <label htmlFor={`sale-${sale.id}`} className="ml-3 flex-1 cursor-pointer">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-gray-800">{`Vente #${sale.id} - ${sale.nom_client}`}</span>
                                                <span className="font-bold text-gray-900">{sale.montant_total.toLocaleString('fr-FR')} F</span>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(sale.date_vente).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">Toutes les ventes ont déjà une facture.</p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end mt-6 space-x-4">
                        <button type="button" onClick={handleCloseModals} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Annuler
                        </button>
                        <button type="submit" disabled={!selectedSaleId} className="px-4 py-2 text-sm font-medium text-white bg-blue-700 border border-transparent rounded-md shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            Créer la facture
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default InvoicePage;