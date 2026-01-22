import React, { useEffect, useState } from 'react';
import apiClient from '../services/api';

const SuperadminPage: React.FC = () => {
  const [superadmins, setSuperadmins] = useState([]);
  const [form, setForm] = useState({ email: '', mot_de_passe: '', secret: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSuperadmins = async () => {
    try {
      const data = await apiClient.getUsers({ role: 'superadmin' });
      setSuperadmins(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchSuperadmins();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.createSuperadmin(form);
      setSuccess("Superadmin créé avec succès !");
      setForm({ email: '', mot_de_passe: '', secret: '' });
      fetchSuperadmins();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Créer un Superadmin</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full p-2 border rounded" />
        <input name="mot_de_passe" type="password" placeholder="Mot de passe" value={form.mot_de_passe} onChange={handleChange} required className="w-full p-2 border rounded" />
        <input name="secret" placeholder="Secret" value={form.secret} onChange={handleChange} required className="w-full p-2 border rounded" />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Création...' : 'Créer'}
        </button>
      </form>

      {error && <div className="mt-4 text-red-600">{error}</div>}
      {success && <div className="mt-4 text-green-600">{success}</div>}

      <h3 className="text-lg font-semibold mt-8 mb-2">Liste des Superadmins</h3>
      <ul className="space-y-2">
        {superadmins.map((admin: any) => (
          <li key={admin.id} className="border p-2 rounded">
            <strong>{admin.email}</strong> — {admin.statut}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuperadminPage;
