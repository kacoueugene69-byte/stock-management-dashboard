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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Appel réel à l'API
      const user = await apiClient.login({ nom_utilisateur: username, mot_de_passe: password });
      localStorage.setItem('user', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      alert("Erreur de connexion : Vérifiez vos identifiants");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input
            type="text"
            required
            className="w-full px-3 py-3 border rounded-t-md"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            required
            className="w-full px-3 py-3 border rounded-b-md"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full py-3 bg-blue-700 text-white rounded-md">
            Se connecter
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Pas encore de compte?{' '}
          <button onClick={onSwitchToRegister} className="font-medium text-blue-600 hover:text-blue-500">
            S'inscrire
          </button>
        </p>
      </div>
    </div>
  );
};
export default LoginPage;