import React, { useState } from 'react';
import Logo from './Logo';
import apiClient from '../services/api';

interface RegistrationPageProps {
  onRegister: () => void;
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
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.nom.trim() || !formData.prenom.trim()) {
      setError("Le nom et le prénom sont obligatoires");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Format d'email invalide");
      return false;
    }
    if (formData.mot_de_passe.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
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

    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        email: formData.email.trim().toLowerCase(),
        mot_de_passe: formData.mot_de_passe
      };

      console.log("📤 Envoi des données:", { ...userData, mot_de_passe: "***" });

      await apiClient.register(userData);

      setSuccess(true);
      onRegister();

      // Redirection vers login après 2s
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } catch (err: any) {
      console.error("❌ Erreur:", err);
      setError(err.message || "Erreur lors de l'inscription. Veuillez réessayer.");
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
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
            ✅ Compte créé avec succès ! Redirection vers la connexion...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-2">
            <input name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required disabled={loading || success}
              className="px-3 py-3 border rounded-md focus:ring-2 focus:ring-blue-500" />
            <input name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} required disabled={loading || success}
              className="px-3 py-3 border rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>

          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required disabled={loading || success}
            className="w-full px-3 py-3 border rounded-md focus:ring-2 focus:ring-blue-500" />

          <input name="mot_de_passe" type="password" placeholder="Mot de passe" value={formData.mot_de_passe} onChange={handleChange} required minLength={6} disabled={loading || success}
            className="w-full px-3 py-3 border rounded-md focus:ring-2 focus:ring-blue-500" />

          <input name="confirmPassword" type="password" placeholder="Confirmer mot de passe" value={formData.confirmPassword} onChange={handleChange} required minLength={6} disabled={loading || success}
            className="w-full px-3 py-3 border rounded-md focus:ring-2 focus:ring-blue-500" />

          <button type="submit" disabled={loading || success}
            className="w-full py-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Inscription en cours..." : success ? "✅ Compte créé !" : "S'inscrire"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 pt-4 border-t">
          Déjà un compte ?{" "}
          <button onClick={onSwitchToLogin} className="font-bold text-blue-600 hover:underline" disabled={loading}>
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegistrationPage;
