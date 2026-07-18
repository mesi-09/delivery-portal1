import { useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import CompanySidebar from '../components/CompanySidebar';

export default function ChangePassword({ role }) {
  const [form, setForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.post('/change-password', form);
      setMessage('Password changed successfully.');
      setForm({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (err) {
      setError(err.response?.data?.errors?.new_password?.[0] || err.response?.data?.message || 'Failed to change password');
    }
  };

  const SidebarComponent = role === 'admin' ? Sidebar : CompanySidebar;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarComponent />
      <main className="ml-64 flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Change Password</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 max-w-md">
          {message && <p className="text-green-600 text-sm mb-4">{message}</p>}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <label className="block text-xs text-gray-500 mb-1">Current Password</label>
          <input
            type="password"
            name="current_password"
            value={form.current_password}
            onChange={handleChange}
            className="w-full mb-4 px-3 py-2 border rounded text-sm"
            required
          />

          <label className="block text-xs text-gray-500 mb-1">New Password</label>
          <input
            type="password"
            name="new_password"
            value={form.new_password}
            onChange={handleChange}
            className="w-full mb-4 px-3 py-2 border rounded text-sm"
            required
          />

          <label className="block text-xs text-gray-500 mb-1">Confirm New Password</label>
          <input
            type="password"
            name="new_password_confirmation"
            value={form.new_password_confirmation}
            onChange={handleChange}
            className="w-full mb-6 px-3 py-2 border rounded text-sm"
            required
          />

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
            Update Password
          </button>
        </form>
      </main>
    </div>
  );
}
