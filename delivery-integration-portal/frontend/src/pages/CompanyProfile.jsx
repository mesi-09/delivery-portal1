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
  const [pictureUrl, setPictureUrl] = useState('');
  const [pictureFile, setPictureFile] = useState(null);
  const [pictureError, setPictureError] = useState('');
  const [pictureUploading, setPictureUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProfile = () => {
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
        setPictureUrl(p.profile_picture_url || '');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProfile(); }, []);

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

  const handlePictureUpload = async (e) => {
    e.preventDefault();
    setPictureError('');
    if (!pictureFile) {
      setPictureError('Please choose an image first.');
      return;
    }
    setPictureUploading(true);
    const formData = new FormData();
    formData.append('file', pictureFile);
    try {
      const { data } = await api.post('/partner/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPictureUrl(data.profile_picture_url);
      setPictureFile(null);
    } catch (err) {
      setPictureError(err.response?.data?.message || 'Failed to upload picture');
    } finally {
      setPictureUploading(false);
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
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 max-w-lg">
              <h2 className="font-bold mb-4">Profile Picture</h2>
              <div className="flex items-center gap-4 mb-4">
                {pictureUrl ? (
                  <img src={pictureUrl} alt="Company logo" className="w-20 h-20 rounded-full object-cover border" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                    No image
                  </div>
                )}
                <form onSubmit={handlePictureUpload} className="flex-1 flex gap-2 items-center">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => setPictureFile(e.target.files[0])}
                    className="flex-1 text-sm"
                  />
                  <button type="submit" disabled={pictureUploading} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700 disabled:opacity-50">
                    {pictureUploading ? 'Uploading...' : 'Upload'}
                  </button>
                </form>
              </div>
              {pictureError && <p className="text-red-500 text-xs">{pictureError}</p>}
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 max-w-lg">
              <h2 className="font-bold mb-4">Company Details</h2>
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
          </div>
        )}
      </main>
    </div>
  );
}
