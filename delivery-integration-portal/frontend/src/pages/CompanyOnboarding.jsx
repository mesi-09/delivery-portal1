import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CompanyOnboarding() {
  const [form, setForm] = useState({
    business_name: '',
    business_email: '',
    business_phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/partner/register', form);
      navigate('/company/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create company profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center">Set Up Your Company</h2>
        <p className="text-gray-500 text-sm mb-6 text-center">
          Tell us about your business to start integrating with our delivery network.
        </p>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <input
          type="text"
          name="business_name"
          placeholder="Company Name"
          value={form.business_name}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border rounded"
          required
        />
        <input
          type="email"
          name="business_email"
          placeholder="Business Email"
          value={form.business_email}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border rounded"
        />
        <input
          type="text"
          name="business_phone"
          placeholder="Business Phone"
          value={form.business_phone}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border rounded"
        />
        <input
          type="text"
          name="address"
          placeholder="Business Address"
          value={form.address}
          onChange={handleChange}
          className="w-full mb-6 px-4 py-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}