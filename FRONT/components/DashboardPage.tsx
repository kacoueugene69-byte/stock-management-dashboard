import React, { useEffect, useState } from 'react';
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
import apiClient from '../services/api';

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

const formatCurrency = (amount?: number | null) =>
  (typeof amount === 'number' ? amount : 0).toLocaleString('fr-FR');

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
    totalOrdersCount: 0,
    articlesIn: 0,
    articlesOut: 0
  });

  const currentUser = {
    name: 'Super Admin',
    role: 'Superadministrateur',
    photoUrl: '/api/placeholder/40/40'
  };

  useEffect(() => {
    let mounted = true;

    const fetchDashboardData = async () => {
      try {
        let fetchedStats: any = null;
        let movements: any = null;

        if (apiClient && typeof apiClient.getStats === 'function') {
          try {
            fetchedStats = await apiClient.getStats();
          } catch (err) {
            console.warn('apiClient.getStats failed:', err);
            fetchedStats = null;
          }
        }

        if (apiClient && typeof apiClient.getArticleMovements === 'function') {
          try {
            movements = await apiClient.getArticleMovements();
          } catch (err) {
            console.warn('apiClient.getArticleMovements failed:', err);
            movements = null;
          }
        }

        if (!mounted) return;

        // Forcer des nombres pour éviter erreurs runtime
        const nextStats = {
          totalSalesCount: Number(fetchedStats?.totalSalesCount ?? 0),
          totalRevenue: Number(fetchedStats?.totalRevenue ?? 0),
          totalOrdersCount: Number(fetchedStats?.totalOrdersCount ?? 0),
          articlesIn: Number(movements?.in ?? 0),
          articlesOut: Number(movements?.out ?? 0)
        };

        // debug log (supprime en production)
        // console.debug('Dashboard nextStats', nextStats);

        setStats(nextStats);
      } catch (err) {
        console.error('Erreur lors du chargement du dashboard:', err);
        if (!mounted) return;
        setStats({
          totalSalesCount: 0,
          totalRevenue: 0,
          totalOrdersCount: 0,
          articlesIn: 0,
          articlesOut: 0
        });
      }
    };

    fetchDashboardData();

    return () => {
      mounted = false;
    };
  }, []);

  const handlePageChange = (page: string) => {
    if (page === activePage) return;
    setIsLoading(true);
    setTimeout(() => {
      setActivePage(page);
      setIsLoading(false);
    }, 300);
  };

  const handleNotificationClick = (notificationId: number) => {
    const clicked = notifications.find((n) => n.id === notificationId);
    if (!clicked) return;
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
    if (clicked.linkTo) handlePageChange(clicked.linkTo);
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
                value={String(stats.totalSalesCount ?? 0)}
                change={0}
                changeText="Depuis hier"
                iconBgColor="bg-green-100"
                iconColor="text-green-600"
                icon={<VentesIcon />}
              />
              <StatCard
                title="Revenu"
                value={`${formatCurrency(stats.totalRevenue)} F`}
                change={0}
                changeText="Depuis hier"
                iconBgColor="bg-yellow-100"
                iconColor="text-yellow-600"
                icon={<FactureIcon />}
              />
              <StatCard
                title="Commandes"
                value={String(stats.totalOrdersCount ?? 0)}
                change={0}
                changeText="Depuis hier"
                iconBgColor="bg-blue-100"
                iconColor="text-blue-600"
                icon={<CommandesIcon />}
              />
              <div className="grid grid-cols-1 gap-2">
                <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Articles entrés</div>
                    <div className="text-xl font-semibold text-gray-900">{stats.articlesIn ?? 0}</div>
                    <div className="text-xs text-gray-400">Réceptions / retours</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-full">
                    <DatabaseIcon />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Articles sortis</div>
                    <div className="text-xl font-semibold text-gray-900">{stats.articlesOut ?? 0}</div>
                    <div className="text-xs text-gray-400">Ventes / sorties</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-full">
                    <DatabaseIcon />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <RecentSales onPageChange={handlePageChange} sales={[]} />
              <BestSeller products={[]} sales={[]} />
            </div>
          </>
        );

      case 'Produit':
        return <ProductPage />;
      case 'Commandes':
        return <OrderPage />;
      case 'Catégorie':
        return <CategoryPage />;
      case 'Magasins':
        return <StorePage />;
      case 'Clients':
        return <ClientPage />;
      case 'Stock':
        return <StockPage />;
      case 'Ventes':
        return <SalesPage />;
      case 'Factures':
        return <InvoicePage />;
      case 'Fournisseurs':
        return <SupplierPage />;
      case 'Inventaire':
        return <InventoryPage />;
      case 'Personnels':
        return <StaffPage />;
      case 'Utilisateur':
        return <UserPage />;
      case 'Configuration':
        return <ConfigurationPage />;
      default:
        return <div className="p-8 text-center text-gray-500">Page "{activePage}" non trouvée.</div>;
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((v) => !v);
    setIsMobileMenuOpen((v) => !v);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {isLoading && <LoadingSpinner />}
      <Sidebar
        onLogout={handleRequestLogout}
        activePage={activePage}
        onPageChange={handlePageChange}
        isCollapsed={isSidebarCollapsed}
      />
      {isMobileMenuOpen && (
        <>
          <Sidebar
            onLogout={handleRequestLogout}
            activePage={activePage}
            onPageChange={(p) => {
              handlePageChange(p);
              setIsMobileMenuOpen(false);
            }}
            isCollapsed={false}
            variant="mobile"
          />
          <div className="fixed inset-0 bg-black/40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} aria-hidden="true" />
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
        <main className="flex-1 p-6 overflow-auto">{renderContent()}</main>
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
