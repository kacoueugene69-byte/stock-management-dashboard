
import React, { useState, useRef, useEffect } from 'react';
import { MenuIcon, ChevronDownIcon, SearchIcon, BellIcon } from './icons';
import { type Notification } from './DashboardPage';

interface User {
    name: string;
    role: string;
    photoUrl?: string;
}

interface HeaderProps {
    pageTitle: string;
    user: User;
    onLogout: () => void;
    onToggleSidebar: () => void;
    isSidebarCollapsed: boolean;
    notifications: Notification[];
    onNotificationClick: (id: number) => void;
    onMarkAllAsRead: () => void;
}

const Header: React.FC<HeaderProps> = ({ pageTitle, user, onLogout, onToggleSidebar, isSidebarCollapsed, notifications, onNotificationClick, onMarkAllAsRead }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleNotificationDropdown = () => setIsNotificationOpen(!isNotificationOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="flex items-center justify-between h-20 px-6 bg-white border-b border-gray-200">
      <div className="flex items-center">
        <button onClick={onToggleSidebar} className="p-2 -ml-2 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none focus:ring">
          <MenuIcon className="w-6 h-6" />
        </button>
        <h1 className="ml-2 text-lg font-semibold text-gray-800">{pageTitle === 'Dashboard' ? 'Tableau de bord' : pageTitle}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
                type="search"
                name="search"
                id="search"
                className="block w-full py-2 pl-10 pr-3 text-sm placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Rechercher..."
            />
        </div>

        <div className="relative" ref={notificationRef}>
          <button onClick={toggleNotificationDropdown} className="relative p-2 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <BellIcon className="w-6 h-6" />
            {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
          </button>
          {isNotificationOpen && (
              <div className="absolute right-0 z-20 w-80 mt-2 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="flex items-center justify-between px-4 py-2 border-b">
                      <h4 className="font-semibold text-gray-800">Notifications</h4>
                      {unreadCount > 0 && (
                          <button onClick={onMarkAllAsRead} className="text-sm font-medium text-blue-600 hover:text-blue-500">
                              Tout marquer comme lu
                          </button>
                      )}
                  </div>
                  <ul className="py-1 max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? notifications.map(notification => (
                          <li key={notification.id} className={`${!notification.read ? 'bg-blue-50' : ''}`}>
                              <a
                                  href="#"
                                  onClick={(e) => {
                                      e.preventDefault();
                                      onNotificationClick(notification.id);
                                      setIsNotificationOpen(false);
                                  }}
                                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                  <p className={`text-gray-800 ${!notification.read ? 'font-bold' : 'font-medium'}`}>{notification.message}</p>
                                  <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                              </a>
                          </li>
                      )) : (
                           <li className="px-4 py-8 text-sm text-center text-gray-500">
                              Aucune nouvelle notification
                          </li>
                      )}
                  </ul>
              </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button onClick={toggleDropdown} className="flex items-center space-x-3">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover bg-gray-200" />
            ) : (
              <div className="flex items-center justify-center w-10 h-10 bg-blue-950 rounded-full text-white font-bold">
                {user.name.charAt(0)}
              </div>
            )}
            <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
            </div>
             <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          </button>
          {isDropdownOpen && (
              <div className="absolute right-0 z-10 w-48 mt-2 py-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mon Profil</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Paramètres</a>
                  <div className="border-t border-gray-100"></div>
                  <button onClick={onLogout} className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100">
                      Déconnexion
                  </button>
              </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;