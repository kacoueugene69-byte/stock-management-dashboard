import React, { useState } from 'react';
import Logo from './Logo';
import apiClient from '../services/api'; // Vérifiez le chemin

interface LoginPageProps {
  onLogin: (user: any) => void;
  onSwitchToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await apiClient.login({ nom_utilisateur: username, mot_de_passe: password });
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setError("Identifiants invalides ou erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-50">
            <Logo />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">CDCOM-FACI</h1>
          <p className="text-sm text-gray-500">Connectez-vous à votre compte</p>
          <p className="text-xs text-gray-400">Bienvenue ! Veuillez entrer vos identifiants.</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          )}
          <div className="space-y-3">
            <input
              type="text"
              required
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Adresse e-mail"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              required
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className="text-gray-700">Se souvenir de moi</span>
            </label>
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700"
              onClick={() => alert('Fonctionnalité à venir')}
            >
              Mot de passe oublié?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          Pas encore de compte?{' '}
          <button onClick={onSwitchToRegister} className="font-medium text-blue-600 hover:text-blue-700">
            S'inscrire
          </button>
        </p>
      </div>
    </div>
  );
};
export default LoginPage;