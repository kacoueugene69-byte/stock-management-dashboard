
import React, { useState } from 'react';
import { useNotification } from '../hooks/useNotification';
import { InfoIcon, BellIcon, FileTextIcon, DatabaseIcon } from './icons';

interface AppSettings {
    companyName: string;
    address: string;
    phone: string;
    email: string;
    currency: string;
    lowStockAlerts: boolean;
    newSaleNotifications: boolean;
    alertEmail: string;
    criticalSmsAlerts: boolean;
    alertPhone: string;
    invoiceFooter: string;
    dailyReportEnabled: boolean;
    dailyReportTime: string;
    dailyReportSms: boolean;
}

const ConfigurationPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('general');
    const { showNotification } = useNotification();

    const [settings, setSettings] = useState<AppSettings>({
        companyName: '',
        address: '',
        phone: '',
        email: '',
        currency: 'F CFA',
        lowStockAlerts: false,
        newSaleNotifications: true,
        alertEmail: '',
        criticalSmsAlerts: false,
        alertPhone: '',
        invoiceFooter: '',
        dailyReportEnabled: false,
        dailyReportTime: '20:00',
        dailyReportSms: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (e.target.type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setSettings(prev => ({ ...prev, [name]: checked }));
        } else {
            setSettings(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send the settings to your backend
        console.log('Saving settings:', settings);
        showNotification('Paramètres enregistrés avec succès !', 'success');
    };

    const TabButton = ({ tabName, label, icon }: { tabName: string, label: string, icon: React.ReactNode }) => {
        const isActive = activeTab === tabName;
        return (
            <button
                type="button"
                onClick={() => setActiveTab(tabName)}
                className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
            >
                {icon}
                <span className="ml-3">{label}</span>
            </button>
        );
    };

    return (
        <form onSubmit={handleSave}>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Configuration</h1>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300">
                    Enregistrer les modifications
                </button>
            </div>

            <div className="flex flex-col lg:flex-row lg:space-x-8">
                {/* Tab Navigation */}
                <aside className="lg:w-1/4 xl:w-1/5 mb-6 lg:mb-0">
                    <nav className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 p-2 bg-white rounded-xl shadow-sm">
                        <TabButton tabName="general" label="Général" icon={<InfoIcon className="w-5 h-5" />} />
                        <TabButton tabName="notifications" label="Notifications" icon={<BellIcon className="w-5 h-5" />} />
                        <TabButton tabName="billing" label="Facturation" icon={<FileTextIcon className="w-5 h-5" />} />
                        <TabButton tabName="data" label="Données" icon={<DatabaseIcon className="w-5 h-5" />} />
                    </nav>
                </aside>

                {/* Tab Content */}
                <main className="flex-1">
                    {activeTab === 'general' && (
                        <div className="p-6 bg-white rounded-xl shadow-sm space-y-6">
                            <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Informations Générales</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Nom de l'entreprise</label>
                                    <input type="text" name="companyName" id="companyName" value={settings.companyName} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Devise</label>
                                    <input type="text" name="currency" id="currency" value={settings.currency} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresse</label>
                                    <input type="text" name="address" id="address" value={settings.address} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                                    <input type="text" name="phone" id="phone" value={settings.phone} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" name="email" id="email" value={settings.email} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                </div>
                             </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="p-6 bg-white rounded-xl shadow-sm space-y-8">
                            <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Paramètres de Notification</h2>
                            
                            <fieldset>
                                <legend className="text-base font-medium text-gray-900">Notifications par Email</legend>
                                <div className="mt-4 grid grid-cols-1 gap-y-6">
                                    <div className="relative flex items-start">
                                        <div className="flex items-center h-5">
                                            <input id="lowStockAlerts" name="lowStockAlerts" type="checkbox" checked={settings.lowStockAlerts} onChange={handleChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="lowStockAlerts" className="font-medium text-gray-700">Alertes de stock faible</label>
                                            <p className="text-gray-500">Recevoir une notification lorsque le stock d'un produit atteint son seuil d'alerte.</p>
                                        </div>
                                    </div>
                                    <div className="relative flex items-start">
                                        <div className="flex items-center h-5">
                                            <input id="newSaleNotifications" name="newSaleNotifications" type="checkbox" checked={settings.newSaleNotifications} onChange={handleChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="newSaleNotifications" className="font-medium text-gray-700">Notifications de nouvelles ventes</label>
                                            <p className="text-gray-500">Activer les notifications dans la barre de navigation pour chaque nouvelle vente.</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="alertEmail" className="block text-sm font-medium text-gray-700">Email pour les alertes</label>
                                        <input type="email" name="alertEmail" id="alertEmail" value={settings.alertEmail} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                        <p className="mt-2 text-xs text-gray-500">Les notifications critiques par email seront envoyées à cette adresse.</p>
                                    </div>
                                </div>
                            </fieldset>

                            <fieldset>
                                <legend className="text-base font-medium text-gray-900">Notifications par SMS</legend>
                                <div className="mt-4 grid grid-cols-1 gap-y-6">
                                    <div className="relative flex items-start">
                                        <div className="flex items-center h-5">
                                            <input id="criticalSmsAlerts" name="criticalSmsAlerts" type="checkbox" checked={settings.criticalSmsAlerts} onChange={handleChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="criticalSmsAlerts" className="font-medium text-gray-700">Alertes SMS critiques pour le DG</label>
                                            <p className="text-gray-500">Envoyer des SMS pour les notifications critiques (ex: stock faible).</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="alertPhone" className="block text-sm font-medium text-gray-700">Numéro de téléphone du DG pour les SMS</label>
                                        <input type="tel" name="alertPhone" id="alertPhone" value={settings.alertPhone} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="+225 XX XX XX XX XX" />
                                        <p className="mt-2 text-xs text-gray-500">Les alertes et rapports par SMS seront envoyés à ce numéro.</p>
                                    </div>
                                </div>
                            </fieldset>

                             <fieldset>
                                <legend className="text-base font-medium text-gray-900">Rapport de Fin de Journée</legend>
                                <div className="mt-4 grid grid-cols-1 gap-y-6">
                                    <div className="relative flex items-start">
                                        <div className="flex items-center h-5">
                                            <input 
                                                id="dailyReportEnabled" 
                                                name="dailyReportEnabled" 
                                                type="checkbox" 
                                                checked={settings.dailyReportEnabled} 
                                                onChange={handleChange} 
                                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" 
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="dailyReportEnabled" className="font-medium text-gray-700">Activer le rapport journalier</label>
                                            <p className="text-gray-500">Envoyer un résumé des ventes et revenus au DG à la fin de chaque journée.</p>
                                        </div>
                                    </div>
                                    {settings.dailyReportEnabled && (
                                        <div className="pl-8 mt-4 space-y-6 border-l-2 border-gray-200">
                                            <div>
                                                <label htmlFor="dailyReportTime" className="block text-sm font-medium text-gray-700">Heure d'envoi du rapport</label>
                                                <input 
                                                    type="time" 
                                                    name="dailyReportTime" 
                                                    id="dailyReportTime" 
                                                    value={settings.dailyReportTime} 
                                                    onChange={handleChange} 
                                                    className="mt-1 block w-full max-w-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                                                />
                                            </div>
                                            <div className="relative flex items-start">
                                                <div className="flex items-center h-5">
                                                    <input 
                                                        id="dailyReportSms" 
                                                        name="dailyReportSms" 
                                                        type="checkbox" 
                                                        checked={settings.dailyReportSms} 
                                                        onChange={handleChange} 
                                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" 
                                                    />
                                                </div>
                                                <div className="ml-3 text-sm">
                                                    <label htmlFor="dailyReportSms" className="font-medium text-gray-700">Envoyer aussi par SMS</label>
                                                    <p className="text-gray-500">Le rapport sera envoyé par SMS au numéro du DG en plus de l'email.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </fieldset>
                        </div>
                    )}
                    
                    {activeTab === 'billing' && (
                         <div className="p-6 bg-white rounded-xl shadow-sm space-y-6">
                            <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Paramètres de Facturation</h2>
                            <div>
                                <label htmlFor="invoiceFooter" className="block text-sm font-medium text-gray-700">Pied de page de la facture</label>
                                 <textarea name="invoiceFooter" id="invoiceFooter" rows={3} value={settings.invoiceFooter} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                <p className="mt-2 text-xs text-gray-500">Ce texte apparaîtra au bas de chaque facture (ex: informations bancaires, conditions de paiement).</p>
                            </div>
                        </div>
                    )}

                     {activeTab === 'data' && (
                         <div className="p-6 bg-white rounded-xl shadow-sm space-y-6">
                            <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Gestion des Données</h2>
                             <div className="space-y-4">
                                <p className="text-sm text-gray-600">Exportez vos données au format CSV ou créez une sauvegarde complète de l'application.</p>
                                 <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                                     <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Exporter les Produits</button>
                                     <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Exporter les Ventes</button>
                                     <button type="button" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">Créer une Sauvegarde</button>
                                </div>
                             </div>
                        </div>
                    )}
                </main>
            </div>
        </form>
    );
};

export default ConfigurationPage;