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

const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({
    totalSalesCount: 0,
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0
  });

  // Mock current user
  const currentUser = {
    name: 'Super Admin',
    role: 'Superadministrateur',
    photoUrl: '/api/placeholder/40/40' // URL d'image par défaut
  };

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Exemple d'appel API
        // const response = await fetch('/api/stats');
        // const data = await response.json();
        // setStats(data);
        
        // Mock data pour l'instant
        setStats({
          totalSalesCount: 42,
          totalRevenue: 125000,
          totalCost: 75000,
          totalProfit: 50000
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    };
    
    fetchStats();
  }, []);

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

  const renderContent = () => {
    switch (activePage) {
      case 'Dashboard':
        return (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                title="Ventes" 
                value={stats.totalSalesCount.toString()} 
                change={0} 
                changeText="Depuis hier" 
                iconBgColor="bg-green-100"
                iconColor="text-green-600"
                icon={<VentesIcon />}
              />
              <StatCard 
                title="Revenu" 
                value={`${stats.totalRevenue.toLocaleString('fr-FR')} F`} 
                change={0} 
                changeText="Depuis hier" 
                iconBgColor="bg-yellow-100"
                iconColor="text-yellow-600"
                icon={<FactureIcon />}
              />
              <StatCard 
                title="Commandes" 
                value="0" 
                change={0} 
                changeText="Depuis hier"
                iconBgColor="bg-blue-100"
                iconColor="text-blue-600"
                icon={<CommandesIcon />}
              />
              <StatCard 
                title="Profit" 
                value={`${stats.totalProfit.toLocaleString('fr-FR')} F`}
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
        return <div className="p-8 text-center text-gray-500">Page "{activePage}" non trouvée.</div>;
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    setIsMobileMenuOpen((v) => !v);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {isLoading && <LoadingSpinner />}
      {/* Desktop sidebar */}
      <Sidebar 
        onLogout={handleRequestLogout} 
        activePage={activePage} 
        onPageChange={handlePageChange} 
        isCollapsed={isSidebarCollapsed} 
      />
      {/* Mobile drawer sidebar */}
      {isMobileMenuOpen && (
        <>
          <Sidebar
            onLogout={handleRequestLogout}
            activePage={activePage}
            onPageChange={(p) => { handlePageChange(p); setIsMobileMenuOpen(false); }}
            isCollapsed={false}
            variant="mobile"
          />
          <div
            className="fixed inset-0 bg-black/40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        </>
      )}
      <div className="flex flex-col flex-1 min-w-0">
        <Header 
          pageTitle={activePage} 
          user={currentUser}
          onLogout={handleRequestLogout} 
          onToggleSidebar={handleToggleSidebar} 
          isSidebarCollapsed={isSidebarCollapsed}
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
        <main className="flex-1 p-6 overflow-auto">
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