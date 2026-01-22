import React, { useState } from 'react';
import Logo from './Logo';
import apiClient from '../services/api';

interface RegistrationPageProps {
  onRegister: () => void;
  onSwitchToLogin: () => void;
}

const RegistrationPage: React.FC<RegistrationPageProps> = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    mot_de_passe: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    const email = formData.email.trim();
    const password = formData.mot_de_passe;
    const confirm = formData.confirmPassword;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format d'email invalide");
      return false;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        email: formData.email.trim().toLowerCase(),
        mot_de_passe: formData.mot_de_passe
      };

      // apiClient.register doit envoyer mot_de_passe en clair au backend
      // Le backend doit hacher le mot de passe avec bcrypt avant de le stocker.
      await apiClient.register(payload);

      setSuccess(true);
      onRegister();

      setTimeout(() => {
        onSwitchToLogin();
      }, 1500);
    } catch (err: any) {
      // Gestion robuste des erreurs provenant du backend ou fetch
      const message =
        err?.message ||
        (err?.response && err.response.data && err.response.data.error) ||
        "Erreur lors de l'inscription. Veuillez réessayer.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <Logo />
          <h2 className="text-2xl font-bold text-gray-800">Créez votre compte</h2>
          <p className="mt-2 text-sm text-gray-500">Rejoignez CDCOM-FACI aujourd'hui.</p>
        </div>

        {error && (
          <div role="alert" className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div role="status" className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
            ✅ Compte créé avec succès ! Redirection vers la connexion...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6" noValidate>
          <label className="block">
            <span className="sr-only">Email</span>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading || success}
              aria-invalid={!!error}
              className="w-full px-3 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <div className="relative">
            <label className="block">
              <span className="sr-only">Mot de passe</span>
              <input
                name="mot_de_passe"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                value={formData.mot_de_passe}
                onChange={handleChange}
                required
                minLength={6}
                disabled={loading || success}
                aria-describedby="password-help"
                className="w-full px-3 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute right-2 top-2 text-sm text-gray-600 px-2 py-1 rounded"
            >
              {showPassword ? 'Masquer' : 'Voir'}
            </button>
          </div>

          <label className="block">
            <span className="sr-only">Confirmer mot de passe</span>
            <input
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirmer mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              disabled={loading || success}
              className="w-full px-3 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Inscription en cours..." : success ? "✅ Compte créé !" : "S'inscrire"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 pt-4 border-t">
          Déjà un compte ?{' '}
          <button
            onClick={onSwitchToLogin}
            className="font-bold text-blue-600 hover:underline"
            disabled={loading}
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegistrationPage;
