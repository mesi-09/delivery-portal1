import { useEffect, useState } from 'react';
import CompanySidebar from '../components/CompanySidebar';
import CompanyStatusBanner from '../components/CompanyStatusBanner';
import api from '../services/api';

export default function CompanyProfile() {
  const [form, setForm] = useState({
    business_name: '',
    business_email: '',
    business_phone: '',
    address: '',
  });
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/partner/me')
      .then((res) => {
        const p = res.data.partner;
        setForm({
          business_name: p.business_name || '',
          business_email: p.business_email || '',
          business_phone: p.business_phone || '',
          address: p.address || '',
        });
        setStatus(p.status);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.patch('/partner/profile', form);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <CompanySidebar />
      <main className="ml-64 flex-1 p-8">
        <CompanyStatusBanner />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Company Profile</h1>
          {status && (
            <span className={`text-sm px-3 py-1 rounded-full capitalize font-medium ${statusColor[status]}`}>
              {status}
            </span>
          )}
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 max-w-lg">
            {message && <p className="text-green-600 text-sm mb-4">{message}</p>}
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <label className="block text-xs text-gray-500 mb-1">Company Name</label>
            <input
              type="text"
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
              className="w-full mb-4 px-3 py-2 border rounded text-sm"
              required
            />

            <label className="block text-xs text-gray-500 mb-1">Business Email</label>
            <input
              type="email"
              name="business_email"
              value={form.business_email}
              onChange={handleChange}
              className="w-full mb-4 px-3 py-2 border rounded text-sm"
            />

            <label className="block text-xs text-gray-500 mb-1">Business Phone</label>
            <input
              type="text"
              name="business_phone"
              value={form.business_phone}
              onChange={handleChange}
              className="w-full mb-4 px-3 py-2 border rounded text-sm"
            />

            <label className="block text-xs text-gray-500 mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full mb-6 px-3 py-2 border rounded text-sm"
            />

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
              Save Changes
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
