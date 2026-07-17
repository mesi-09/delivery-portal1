import { useEffect, useState } from 'react';
import CompanySidebar from '../components/CompanySidebar';
import CompanyStatusBanner from '../components/CompanyStatusBanner';
import api from '../services/api';

export default function CompanySettings() {
  const [keys, setKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [isSandbox, setIsSandbox] = useState(true);
  const [revealedKey, setRevealedKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadKeys = () => {
    api.get('/partner/api-keys')
      .then((res) => setKeys(res.data.api_keys))
      .catch(() => {});
  };

  useEffect(() => { loadKeys(); }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setRevealedKey('');
    try {
      const { data } = await api.post('/partner/api-keys', {
        name: newKeyName || null,
        is_sandbox: isSandbox,
      });
      setRevealedKey(data.api_key);
      setNewKeyName('');
      loadKeys();
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Your email is not verified yet. Please check your inbox for the verification link before generating API keys.');
      } else {
        setError(err.response?.data?.message || 'Failed to generate key');
      }
    }
  };

  const handleRevoke = async (id) => {
    if (!confirm('Revoke this API key? This cannot be undone.')) return;
    await api.delete(`/partner/api-keys/${id}`);
    loadKeys();
  };

  const handleWebhookSave = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.patch('/partner/webhook', { webhook_url: webhookUrl });
      setMessage('Webhook URL saved successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save webhook URL');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <CompanySidebar />
      <main className="ml-64 flex-1 p-8 space-y-8">
        <CompanyStatusBanner />
        <h1 className="text-3xl font-bold">Developer Settings</h1>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-bold mb-4">API Keys</h2>

          {revealedKey && (
            <div className="bg-yellow-50 border border-yellow-300 rounded p-4 mb-4 text-sm">
              <p className="font-semibold mb-1">Save this key now — it won't be shown again:</p>
              <code className="block bg-white p-2 rounded border">{revealedKey}</code>
            </div>
          )}

          <form onSubmit={handleGenerate} className="flex gap-3 mb-6 items-center">
            <input
              type="text"
              placeholder="Key name (optional)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 px-3 py-2 border rounded text-sm"
            />
            <select value={isSandbox} onChange={(e) => setIsSandbox(e.target.value === 'true')} className="px-3 py-2 border rounded text-sm">
              <option value="true">Sandbox</option>
              <option value="false">Live</option>
            </select>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
              Generate
            </button>
          </form>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Name</th>
                <th className="pb-2">Key</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-b last:border-0">
                  <td className="py-3">{k.name || '-'}</td>
                  <td className="py-3 font-mono text-xs">{k.masked_key}</td>
                  <td className="py-3">{k.is_sandbox ? 'Sandbox' : 'Live'}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${k.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                      {k.is_active ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td className="py-3">
                    {k.is_active && (
                      <button onClick={() => handleRevoke(k.id)} className="text-red-600 hover:underline text-xs">
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-bold mb-4">Webhook Endpoint</h2>
          <form onSubmit={handleWebhookSave} className="flex gap-3">
            <input
              type="url"
              placeholder="https://yourapp.com/webhooks/delivery"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 px-3 py-2 border rounded text-sm"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
              Save
            </button>
          </form>
          {message && <p className="text-sm mt-2 text-gray-600">{message}</p>}
        </div>
      </main>
    </div>
  );
}
