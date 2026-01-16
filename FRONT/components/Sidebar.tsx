
import React from 'react';
import Logo from './Logo';
import { 
    DashboardIcon, ProductIcon, CommandesIcon, CategoryIcon, StoreIcon, ClientsIcon, StockIcon,
    VentesIcon, FactureIcon, FournisseursIcon, InventaireIcon, PersonnelsIcon, UtilisateurIcon, ConfigurationIcon, DeconnexionIcon
} from './icons';

interface SidebarProps {
  onLogout: () => void;
  activePage: string;
  onPageChange: (page: string) => void;
  isCollapsed: boolean;
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
    isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active = false, onClick, isCollapsed }) => {
    const baseClasses = "flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 w-full";
    const activeClasses = "bg-blue-900 text-white";
    const inactiveClasses = "text-blue-200 hover:bg-blue-800 hover:text-white";
    return (
        <li>
            <button 
                onClick={onClick} 
                className={`${baseClasses} ${active ? activeClasses : inactiveClasses} ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? label : undefined}
            >
                {icon}
                {!isCollapsed && <span className="ml-4 whitespace-nowrap">{label}</span>}
            </button>
        </li>
    );
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, activePage, onPageChange, isCollapsed }) => {

  const navItems = [
    { icon: <DashboardIcon className="w-5 h-5" />, label: "Dashboard" },
    { icon: <ProductIcon className="w-5 h-5" />, label: "Produit" },
    { icon: <CommandesIcon className="w-5 h-5" />, label: "Commandes" },
    { icon: <CategoryIcon className="w-5 h-5" />, label: "Catégorie" },
    { icon: <StoreIcon className="w-5 h-5" />, label: "Magasins" },
    { icon: <ClientsIcon className="w-5 h-5" />, label: "Clients" },
    { icon: <StockIcon className="w-5 h-5" />, label: "Stock" },
    { icon: <VentesIcon className="w-5 h-5" />, label: "Ventes" },
    { icon: <FactureIcon className="w-5 h-5" />, label: "Factures" },
    { icon: <FournisseursIcon className="w-5 h-5" />, label: "Fournisseurs" },
    { icon: <InventaireIcon className="w-5 h-5" />, label: "Inventaire" },
    { icon: <PersonnelsIcon className="w-5 h-5" />, label: "Personnels" },
    { icon: <UtilisateurIcon className="w-5 h-5" />, label: "Utilisateur" },
    { icon: <ConfigurationIcon className="w-5 h-5" />, label: "Configuration" },
  ];

  return (
    <aside className={`hidden md:flex flex-col bg-blue-950 text-white transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center h-20 border-b border-blue-900 flex-shrink-0 ${isCollapsed ? 'justify-center' : 'px-4'}`}>
        <Logo variant="light-on-dark" size={isCollapsed ? 'md' : 'sm'} iconOnly={isCollapsed} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
                {navItems.map((item) => (
                    <NavItem 
                        key={item.label} 
                        icon={item.icon} 
                        label={item.label} 
                        active={activePage === item.label}
                        onClick={() => onPageChange(item.label)}
                        isCollapsed={isCollapsed}
                    />
                ))}
            </ul>
        </nav>

        <div className="p-4 border-t border-blue-900">
            <button onClick={onLogout} className={`flex items-center w-full px-4 py-2.5 text-blue-200 rounded-lg hover:bg-red-600 hover:text-white transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''}`}>
                <DeconnexionIcon className="w-5 h-5" />
                {!isCollapsed && <span className="ml-4 whitespace-nowrap">Déconnexion</span>}
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
