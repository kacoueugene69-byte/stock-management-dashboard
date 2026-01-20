import React, { useState } from 'react';
import Logo from './Logo';
import apiClient from '../services/api';

interface RegistrationPageProps {
  onRegister: (userData: any) => void;
  onSwitchToLogin: () => void;
}

const RegistrationPage: React.FC<RegistrationPageProps> = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Efface l'erreur quand l'utilisateur tape
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    // Validation du nom et prénom
    if (!formData.nom.trim() || !formData.prenom.trim()) {
      setError("Le nom et le prénom sont obligatoires");
      return false;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Format d'email invalide");
      return false;
    }

    // Validation du mot de passe
    if (formData.mot_de_passe.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }

    // Vérification de la correspondance des mots de passe
    if (formData.mot_de_passe !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation du formulaire
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Préparation des données (sans confirmPassword)
      const userData = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        email: formData.email.trim().toLowerCase(),
        mot_de_passe: formData.mot_de_passe
      };

      console.log('📤 Envoi des données d\'inscription:', { ...userData, mot_de_passe: '***' });

      // Appel API
      const response = await apiClient.register(userData);
      
      console.log('✅ Inscription réussie:', response);

      setSuccess(true);

      // Redirection vers la page de connexion après 2 secondes
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);

    } catch (err: any) {
      console.error('❌ Erreur lors de l\'inscription:', err);
      setError(err.message || "Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Créez votre compte</h2>
          <p className="mt-2 text-sm text-gray-500">Rejoignez CDCOM-FACI aujourd'hui.</p>
        </div>

        <div className="mt-8 space-y-4">
          {/* Message d'erreur */}
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md animate-pulse">
              ⚠️ {error}
            </div>
          )}

          {/* Message de succès */}
          {success && (
            <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
              ✅ Compte créé avec succès ! Redirection vers la connexion...
            </div>
          )}

          <div className="space-y-3">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input 
                  name="nom" 
                  type="text" 
                  required 
                  placeholder="Doe" 
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" 
                  onChange={handleChange} 
                  value={formData.nom}
                  disabled={loading || success}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input 
                  name="prenom" 
                  type="text" 
                  required 
                  placeholder="John" 
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" 
                  onChange={handleChange} 
                  value={formData.prenom}
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Adresse e-mail *
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="john.doe@example.com"
                onChange={handleChange}
                value={formData.email}
                disabled={loading || success}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Mot de passe * (min. 6 caractères)
              </label>
              <input
                name="mot_de_passe"
                type="password"
                required
                minLength={6}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="••••••••"
                onChange={handleChange}
                value={formData.mot_de_passe}
                disabled={loading || success}
              />
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Confirmer le mot de passe *
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="••••••••"
                onChange={handleChange}
                value={formData.confirmPassword}
                disabled={loading || success}
              />
            </div>
          </div>

          {/* Bouton de soumission */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || success}
            className="w-full py-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Inscription en cours...
              </span>
            ) : success ? (
              "✅ Compte créé !"
            ) : (
              "S'inscrire"
            )}
          </button>
        </div>

        {/* Lien vers connexion */}
        <p className="text-center text-sm text-gray-600 pt-4 border-t">
          Déjà un compte ?{' '}
          <button 
            onClick={onSwitchToLogin} 
            className="font-bold text-blue-600 hover:text-blue-700 focus:outline-none hover:underline transition-all"
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