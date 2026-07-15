import { useEffect, useState } from 'react';
import CompanySidebar from '../components/CompanySidebar';
import api from '../services/api';

export default function CompanySettings() {
  const [keys, setKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [isSandbox, setIsSandbox] = useState(true);
  const [revealedKey, setRevealedKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [documents, setDocuments] = useState([]);
  const [docFile, setDocFile] = useState(null);
  const [docType, setDocType] = useState('business_license');
  const [docError, setDocError] = useState('');
  const [docUploading, setDocUploading] = useState(false);

  const loadKeys = () => {
    api.get('/partner/api-keys')
      .then((res) => setKeys(res.data.api_keys))
      .catch(() => {});
  };

  const loadDocuments = () => {
    api.get('/partner/documents')
      .then((res) => setDocuments(res.data.documents))
      .catch(() => {});
  };

  useEffect(() => {
    loadKeys();
    loadDocuments();
  }, []);

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

  const handleDocUpload = async (e) => {
    e.preventDefault();
    setDocError('');
    if (!docFile) {
      setDocError('Please choose a file first.');
      return;
    }
    setDocUploading(true);
    const formData = new FormData();
    formData.append('file', docFile);
    formData.append('type', docType);
    try {
      await api.post('/partner/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDocFile(null);
      e.target.reset();
      loadDocuments();
    } catch (err) {
      setDocError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setDocUploading(false);
    }
  };

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <CompanySidebar />
      <main className="ml-64 flex-1 p-8 space-y-8">
        <h1 className="text-3xl font-bold">Developer Settings</h1>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-bold mb-4">Company Verification Documents</h2>
          <p className="text-sm text-gray-500 mb-4">
            Upload your business license or registration document (PDF, JPG, or PNG, max 10MB) for admin review.
          </p>

          <form onSubmit={handleDocUpload} className="flex gap-3 mb-6 items-center">
            <select value={docType} onChange={(e) => setDocType(e.target.value)} className="px-3 py-2 border rounded text-sm">
              <option value="business_license">Business License</option>
              <option value="tax_certificate">Tax Certificate</option>
              <option value="id_document">ID Document</option>
              <option value="other">Other</option>
            </select>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setDocFile(e.target.files[0])}
              className="flex-1 text-sm"
            />
            <button type="submit" disabled={docUploading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm disabled:opacity-50">
              {docUploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
          {docError && <p className="text-red-500 text-sm mb-4">{docError}</p>}

          {documents.length === 0 ? (
            <p className="text-gray-500 text-sm">No documents uploaded yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">File</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Admin Note</th>
                  <th className="pb-2">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b last:border-0">
                    <td className="py-3">{doc.original_name}</td>
                    <td className="py-3 capitalize">{doc.type.replace('_', ' ')}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColor[doc.status]}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-gray-500">{doc.admin_note || '-'}</td>
                    <td className="py-3 text-xs">{new Date(doc.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

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
