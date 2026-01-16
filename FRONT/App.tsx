import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import RegistrationPage from './components/RegistrationPage';
import LoadingSpinner from './components/LoadingSpinner';
import { NotificationProvider, useNotification } from './hooks/useNotification';
import NotificationContainer from './components/NotificationContainer';

type View = 'login' | 'register' | 'dashboard';

interface User {
  id: number;
  nom_utilisateur: string;
  email: string;
  role: string;
  nom?: string;
  prenom?: string;
}

const AppContent: React.FC = () => {
  const [view, setView] = useState<View>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { showNotification } = useNotification();

  // Vérifier si l'utilisateur est déjà connecté au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setView('dashboard');
      } catch (err) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (user: User) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentUser(user);
      setView('dashboard');
      setIsLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    setView('login');
    showNotification('Déconnecté avec succès', 'success');
  };

  const handleRegister = () => {
    showNotification('Inscription réussie ! Veuillez vous connecter.', 'success');
    setView('login');
  };

  const renderView = () => {
    switch (view) {
      case 'login':
        return (
          <LoginPage 
            onLogin={handleLogin} 
            onSwitchToRegister={() => setView('register')} 
          />
        );
      case 'register':
        return (
          <RegistrationPage 
            onRegister={handleRegister} 
            onSwitchToLogin={() => setView('login')} 
          />
        );
      case 'dashboard':
        return (
          <DashboardPage 
            user={currentUser} 
            onLogout={handleLogout} 
          />
        );
      default:
        return (
          <LoginPage 
            onLogin={handleLogin} 
            onSwitchToRegister={() => setView('register')} 
          />
        );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {isLoading ? <LoadingSpinner /> : renderView()}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <NotificationContainer />
      <AppContent />
    </NotificationProvider>
  );
};

export default App;