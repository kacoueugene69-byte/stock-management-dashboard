import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import RegistrationPage from './components/RegistrationPage';
import LoadingSpinner from './components/LoadingSpinner';
import { NotificationProvider, useNotification } from './hooks/useNotification';
import NotificationContainer from './components/NotificationContainer';
import { ApiService } from './services/api';

type View = 'login' | 'register' | 'dashboard';

interface User {
  id: number;
  email: string;
  role: string;
  statut?: string;
  derniere_connexion?: string | null;
  created_at?: string | null;
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
        const user = JSON.parse(savedUser) as User;
        setCurrentUser(user);
        setView('dashboard');
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Connexion réelle via API
  const handleLogin = async (credentials: { email: string; mot_de_passe: string }) => {
    setIsLoading(true);
    try {
      const data = await ApiService.login(credentials);
      // L'API peut renvoyer { user } ou directement user
      const user: User = (data && (data.user ?? data)) as User;

      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      setView('dashboard');
      showNotification('Connexion réussie ✅', 'success');
    } catch (err: any) {
      showNotification(err?.message || 'Erreur lors de la connexion', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Déconnexion
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    setView('login');
    showNotification('Déconnecté avec succès', 'success');
  };

  // Inscription : RegistrationPage appelle déjà ApiService.register et ensuite onRegister()
  const handleRegister = async () => {
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
