import React, { useState } from 'react';
import { useNotification } from '../hooks/useNotification';

interface LoginPageProps {
  onLogin: (user: any) => void;
  onSwitchToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToRegister }) => {
  const [nom_utilisateur, setNomUtilisateur] = useState('');
  const [mot_de_passe, setMotDePasse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nom_utilisateur || !mot_de_passe) {
      showNotification('Veuillez remplir tous les champs', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom_utilisateur, mot_de_passe })
      });

      const data = await response.json();

      if (!response.ok) {
        showNotification(data.error || 'Erreur de connexion', 'error');
        return;
      }

      showNotification(`Bienvenue ${data.nom_utilisateur} !`, 'success');
      // Sauvegarder l'utilisateur et passer au dashboard
      localStorage.setItem('user', JSON.stringify(data));
      onLogin(data);
    } catch (err) {
      showNotification('Erreur de connexion au serveur', 'error');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">CDCOM-FACI</h1>
          <h2 className="mt-4 text-xl font-bold text-gray-700">Gestion de Stock</h2>
          <p className="mt-2 text-sm text-gray-500">
            Connectez-vous pour accéder au tableau de bord
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="nom_utilisateur" className="sr-only">
                Nom d'utilisateur
              </label>
              <input
                id="nom_utilisateur"
                name="nom_utilisateur"
                type="text"
                autoComplete="username"
                required
                value={nom_utilisateur}
                onChange={(e) => setNomUtilisateur(e.target.value)}
                className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Nom d'utilisateur"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={mot_de_passe}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember-me" className="block ml-2 text-sm text-gray-900">
                Se souvenir de moi
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Mot de passe oublié?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md group hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Pas encore de compte?{' '}
          <button 
            onClick={onSwitchToRegister} 
            disabled={isLoading}
            className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
          >
            S'inscrire
          </button>
        </p>

        <div className="mt-6 p-4 bg-blue-50 rounded text-sm text-gray-600">
          <p className="font-semibold mb-2">📝 Identifiants de test :</p>
          <p>Username: <code className="bg-white px-2 py-1 rounded">styve_admin</code></p>
          <p>Password: <code className="bg-white px-2 py-1 rounded">password1235678</code></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;