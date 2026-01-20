import React, { useState } from 'react';
import Logo from './Logo';
import apiClient from '../services/api'; 

interface LoginPageProps {
  onLogin: (user: any) => void;
  onSwitchToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation basique
    if (!email.trim() || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);

    try {
      console.log('📤 Tentative de connexion pour:', email);

      // Appel API de connexion
      const response = await apiClient.login({ 
        email: email.trim().toLowerCase(), 
        mot_de_passe: password 
      });

      console.log('✅ Connexion réussie:', response);

      // Extraire les données utilisateur
      const user = response.user || response;

      // Gestion de la persistance (Se souvenir de moi)
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(user));
      storage.setItem('isAuthenticated', 'true');

      // Information de l'application parente du succès de la connexion
      onLogin(user);

    } catch (err: any) {
      console.error('❌ Erreur de connexion:', err);
      
      // Affichage d'un message d'erreur approprié
      if (err.message.includes('401') || err.message.includes('incorrect')) {
        setError("Email ou mot de passe incorrect");
      } else if (err.message.includes('403') || err.message.includes('inactif')) {
        setError("Votre compte est inactif. Contactez l'administrateur.");
      } else if (err.message.includes('network') || err.message.includes('Failed to fetch')) {
        setError("Erreur de connexion au serveur. Vérifiez votre connexion internet.");
      } else {
        setError(err.message || "Erreur lors de la connexion. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="mb-2">
            <Logo />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">CDCOM-FACI</h1>
          <p className="text-sm text-gray-500">Connectez-vous à votre compte</p>
          <p className="text-xs text-gray-400">Veuillez entrer votre adresse email.</p>
        </div>

        <div className="mt-8 space-y-4">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3 animate-pulse">
              ⚠️ {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null); // Efface l'erreur quand l'utilisateur tape
                }}
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe *
              </label>
              <input
                type="password"
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                disabled={loading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit(e);
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 select-none cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading}
              />
              <span className="text-gray-700">Se souvenir de moi</span>
            </label>
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
              onClick={() => alert('Fonctionnalité en cours de développement')}
              disabled={loading}
            >
              Mot de passe oublié?
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connexion...
              </span>
            ) : 'Se connecter'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <button 
              onClick={onSwitchToRegister} 
              className="font-bold text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline transition-all"
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