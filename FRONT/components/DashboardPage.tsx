
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import StatCard from './StatCard';
import RecentSales from './RecentSales';
import BestSeller from './BestSeller';
import ProductPage from './ProductPage';
import OrderPage from './OrderPage';
import CategoryPage from './CategoryPage';
import StorePage from './StorePage';
import ClientPage from './ClientPage';
import StockPage from './StockPage';
import SalesPage from './SalesPage';
import SupplierPage from './SupplierPage';
import InventoryPage from './InventoryPage';
import StaffPage from './StaffPage';
import UserPage from './UserPage';
import ConfigurationPage from './ConfigurationPage';
import LoadingSpinner from './LoadingSpinner';
import InvoicePage from './InvoicePage';
import ConfirmationModal from './ConfirmationModal';
import { DeconnexionIcon, VentesIcon, FactureIcon, CommandesIcon, DatabaseIcon } from './icons';

interface DashboardPageProps {
  onLogout: () => void;
}

export type Notification = {
  id: number;
  message: string;
  timestamp: string;
  read: boolean;
  linkTo: string;
};

const userAvatarSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="lightgray" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`;
const userAvatarDataUrl = `data:image/svg+xml;base64,${btoa(userAvatarSvg)}`;

const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Mock current user
  const currentUser = {
    name: 'Super Admin',
    role: 'Superadministrateur',
    photoUrl: userAvatarDataUrl
  };

  const handlePageChange = (page: string) => {
    if (page !== activePage) {
      setIsLoading(true);
      setTimeout(() => {
        setActivePage(page);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleNotificationClick = (notificationId: number) => {
    const clickedNotification = notifications.find(n => n.id === notificationId);
    if (clickedNotification) {
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      handlePageChange(clickedNotification.linkTo);
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleRequestLogout = () => {
    setIsLogoutModalOpen(true);
  };


  // Calculate statistics
  const totalSalesCount = 0;
  const totalRevenue = 0;
  const totalCost = 0;
  const totalProfit = 0;


  const renderContent = () => {
    switch (activePage) {
      case 'Dashboard':
        return (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                title="Ventes" 
                value={totalSalesCount.toString()} 
                change={0} 
                changeText="Depuis hier" 
                iconBgColor="bg-green-100"
                iconColor="text-green-600"
                icon={<VentesIcon />}
              />
              <StatCard 
                title="Revenu" 
                value={`${totalRevenue.toLocaleString('fr-FR')} F`} 
                change={0} 
                changeText="Depuis hier" 
                iconBgColor="bg-yellow-100"
                iconColor="text-yellow-600"
                icon={<FactureIcon />}
              />
              <StatCard 
                title="Commande" 
                value="0" 
                change={0} 
                changeText="Depuis hier"
                iconBgColor="bg-blue-100"
                iconColor="text-blue-600"
                icon={<CommandesIcon />}
              />
              <StatCard 
                title="Profit" 
                value={`${totalProfit.toLocaleString('fr-FR')} F`}
                change={0} 
                changeText="Depuis hier" 
                iconBgColor="bg-pink-100"
                iconColor="text-pink-600"
                icon={<DatabaseIcon />}
              />
            </div>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <RecentSales onPageChange={handlePageChange} sales={[]} />
              <BestSeller products={[]} sales={[]} />
            </div>
          </>
        );
      case 'Produit': return <ProductPage />;
      case 'Commandes': return <OrderPage />;
      case 'Catégorie': return <CategoryPage />;
      case 'Magasins': return <StorePage />;
      case 'Clients': return <ClientPage />;
      case 'Stock': return <StockPage />;
      case 'Ventes': return <SalesPage />;
      case 'Factures': return <InvoicePage />;
      case 'Fournisseurs': return <SupplierPage />;
      case 'Inventaire': return <InventoryPage />;
      case 'Personnels': return <StaffPage />;
      case 'Utilisateur': return <UserPage />;
      case 'Configuration': return <ConfigurationPage />;
      default:
        return <div>Page "{activePage}" non trouvée.</div>;
    }
  };


  return (
    <div className="flex h-screen bg-gray-50">
      {isLoading && <LoadingSpinner />}
      <Sidebar onLogout={handleRequestLogout} activePage={activePage} onPageChange={handlePageChange} isCollapsed={isSidebarCollapsed} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header 
          pageTitle={activePage} 
          user={currentUser}
          onLogout={handleRequestLogout} 
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          isSidebarCollapsed={isSidebarCollapsed}
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={onLogout}
        title="Confirmer la déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmButtonText="Se déconnecter"
        confirmButtonClassName="bg-blue-700 hover:bg-blue-800 focus:ring-blue-500"
        icon={<DeconnexionIcon className="h-6 w-6 text-blue-600" />}
        iconBgClassName="bg-blue-100"
      />
    </div>
  );
};

export default DashboardPage;