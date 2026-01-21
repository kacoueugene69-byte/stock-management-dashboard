import React, { useState } from 'react';
import Logo from './Logo';
import apiClient from '../services/api'; 

interface LoginPageProps {
  onLogin: (user: any) => void;
  onSwitchToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !motDePasse) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.login({ 
        email: email.trim().toLowerCase(), 
        mot_de_passe: motDePasse 
      });

      const user = response.user || response;

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(user));
      storage.setItem('isAuthenticated', 'true');

      onLogin(user);
    } catch (err: any) {
      if (err.message.includes('incorrect')) {
        setError("Email ou mot de passe incorrect");
      } else {
        setError(err.message || "Erreur lors de la connexion");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <Logo />
          <h1 className="text-2xl font-extrabold text-gray-900">CDCOM-FACI</h1>
          <p className="text-sm text-gray-500">Connectez-vous à votre compte</p>
        </div>

        {error && (
          <div className="mt-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              className="w-full px-3 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
            <input
              type="password"
              required
              className="w-full px-3 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading}
              />
              <span>Se souvenir de moi</span>
            </label>
            <button type="button" className="text-blue-600 hover:underline" disabled={loading}>
              Mot de passe oublié ?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{" "}
            <button 
              onClick={onSwitchToRegister} 
              className="font-bold text-blue-600 hover:underline"
              disabled={loading}
            >
              S'inscrire gratuitement
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
