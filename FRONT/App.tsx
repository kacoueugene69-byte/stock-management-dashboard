// App.tsx - VERSION CORRIGÉE ET UNIFIÉE
import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import RegistrationPage from './components/RegistrationPage';
import LoadingSpinner from './components/LoadingSpinner';
import { NotificationProvider, useNotification } from './hooks/useNotification';
import NotificationContainer from './components/NotificationContainer';
import { ApiService, setAuthToken } from './services/api';
import { loadAuthTokenFromStorage } from './services/api';

type View = 'login' | 'register' | 'dashboard';

interface User {
  id: number;
  email: string;
  role: string;
  statut: string;
  created_at: string | null;
}

const AppContent: React.FC = () => {
  const [view, setView] = useState<View>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { showNotification } = useNotification();

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const checkAuth = () => {
      console.log('🔍 Vérification auth au démarrage:');
      
      const token = localStorage.getItem('gstock_token') || localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user');
      
      console.log('   Token trouvé:', !!token);
      console.log('   User trouvé:', !!savedUser);
      
      if (token && savedUser) {
        try {
          const user = JSON.parse(savedUser) as User;
          console.log('✅ Utilisateur valide:', user.email);
          
          setCurrentUser(user);
          setView('dashboard');
          
          // Charger le token dans ApiService
          loadAuthTokenFromStorage();
        } catch (e) {
          console.error('❌ Erreur parsing user:', e);
          localStorage.clear();
        }
      } else {
        console.log('⚠️ Pas de session active, page login');
        setView('login');
      }
    };
    
    checkAuth();
  }, []);

  // Connexion via API - FONCTION CORRIGÉE
  const handleLogin = async (credentials: { email: string; mot_de_passe: string }) => {
    console.log('🔄 Tentative de connexion avec:', credentials.email);
    
    // VALIDATION DES CREDENTIALS
    if (!credentials || !credentials.email || !credentials.mot_de_passe) {
      console.error('❌ Credentials invalides:', credentials);
      showNotification('Email et mot de passe requis', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Nettoyer les credentials
      const cleanCredentials = {
        email: (credentials.email || '').trim().toLowerCase(),
        mot_de_passe: (credentials.mot_de_passe || '').trim()
      };
      
      console.log('📤 Envoi des credentials nettoyés...');
      
      const data = await ApiService.login(cleanCredentials);
      console.log('✅ Réponse API reçue:', data);
      
      if (!data || !data.user) {
        throw new Error('Réponse API invalide');
      }
      
      const user = data.user;
      const token = data.token;
      
      console.log('👤 Utilisateur:', user.email);
      console.log('🔑 Token reçu:', !!token);
      
      // Stocker le token
      if (token) {
        setAuthToken(token);
        console.log('💾 Token stocké');
      }
      
      // Mettre à jour l'état
      setCurrentUser(user);
      
      // Stocker dans localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      
      console.log('🔄 Changement de vue vers dashboard');
      setView('dashboard');
      
      showNotification('Connexion réussie ✅', 'success');
      
      // Forcer un re-render
      setTimeout(() => {
        window.dispatchEvent(new Event('auth-success'));
      }, 100);
      
    } catch (err: any) {
      console.error('❌ Erreur connexion:', err);
      showNotification(err?.message || 'Erreur lors de la connexion', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Déconnexion
  const handleLogout = () => {
    console.log('👋 Déconnexion en cours...');
    
    setCurrentUser(null);
    setAuthToken(null);
    
    localStorage.clear();
    sessionStorage.clear();
    
    setView('login');
    
    showNotification('Déconnecté avec succès', 'success');
    
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  // Inscription
  const handleRegister = async () => {
    showNotification('Inscription réussie ! Veuillez vous connecter.', 'success');
    setView('login');
  };

  // Vue dynamique
  const renderView = () => {
    console.log('🔄 Rendu de la vue:', view);
    console.log('   currentUser:', currentUser?.email || 'null');
    
    switch (view) {
      case 'login':
        return <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setView('register')} />;
      case 'register':
        return <RegistrationPage onRegister={handleRegister} onSwitchToLogin={() => setView('login')} />;
      case 'dashboard':
        if (!currentUser) {
          console.log('⚠️ Dashboard demandé mais pas de user, redirection login');
          return <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setView('register')} />;
        }
        return <DashboardPage user={currentUser} onLogout={handleLogout} />;
      default:
        return <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setView('register')} />;
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