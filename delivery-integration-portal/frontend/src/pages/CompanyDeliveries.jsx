import { useEffect, useState } from 'react';
import CompanySidebar from '../components/CompanySidebar';
import CompanyStatusBanner from '../components/CompanyStatusBanner';
import api from '../services/api';

export default function CompanyDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    pickup_name: '', pickup_phone: '', pickup_address: '', pickup_lat: '', pickup_lng: '',
    dropoff_name: '', dropoff_phone: '', dropoff_address: '', dropoff_lat: '', dropoff_lng: '',
    parcel_category_id: '1', charge_payer: 'sender',
  });

  const loadDeliveries = () => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : {};
    api.get('/partner/deliveries', { params })
      .then((res) => setDeliveries(res.data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load deliveries'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDeliveries(); }, [statusFilter]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/partner/deliveries/manual', {
        pickup: {
          contact_person_name: form.pickup_name,
          contact_person_number: form.pickup_phone,
          address: form.pickup_address,
          latitude: parseFloat(form.pickup_lat),
          longitude: parseFloat(form.pickup_lng),
        },
        dropoff: {
          contact_person_name: form.dropoff_name,
          contact_person_number: form.dropoff_phone,
          address: form.dropoff_address,
          latitude: parseFloat(form.dropoff_lat),
          longitude: parseFloat(form.dropoff_lng),
        },
        parcel_category_id: parseInt(form.parcel_category_id),
        charge_payer: form.charge_payer,
      });
      setShowForm(false);
      loadDeliveries();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create delivery');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.patch(`/partner/deliveries/${id}/cancel`);
      loadDeliveries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel delivery');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <CompanySidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Deliveries</h1>
        <CompanyStatusBanner />
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ New Delivery'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="font-bold mb-4">Create Manual Delivery</h2>
            {formError && <p className="text-red-500 mb-4 text-sm">{formError}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Pickup</h3>
                <input name="pickup_name" placeholder="Contact Name" value={form.pickup_name} onChange={handleChange} className="w-full mb-2 px-3 py-2 border rounded text-sm" required />
                <input name="pickup_phone" placeholder="Contact Phone" value={form.pickup_phone} onChange={handleChange} className="w-full mb-2 px-3 py-2 border rounded text-sm" required />
                <input name="pickup_address" placeholder="Address" value={form.pickup_address} onChange={handleChange} className="w-full mb-2 px-3 py-2 border rounded text-sm" required />
                <div className="flex gap-2">
                  <input name="pickup_lat" placeholder="Latitude" value={form.pickup_lat} onChange={handleChange} className="w-full px-3 py-2 border rounded text-sm" required />
                  <input name="pickup_lng" placeholder="Longitude" value={form.pickup_lng} onChange={handleChange} className="w-full px-3 py-2 border rounded text-sm" required />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Dropoff</h3>
                <input name="dropoff_name" placeholder="Contact Name" value={form.dropoff_name} onChange={handleChange} className="w-full mb-2 px-3 py-2 border rounded text-sm" required />
                <input name="dropoff_phone" placeholder="Contact Phone" value={form.dropoff_phone} onChange={handleChange} className="w-full mb-2 px-3 py-2 border rounded text-sm" required />
                <input name="dropoff_address" placeholder="Address" value={form.dropoff_address} onChange={handleChange} className="w-full mb-2 px-3 py-2 border rounded text-sm" required />
                <div className="flex gap-2">
                  <input name="dropoff_lat" placeholder="Latitude" value={form.dropoff_lat} onChange={handleChange} className="w-full px-3 py-2 border rounded text-sm" required />
                  <input name="dropoff_lng" placeholder="Longitude" value={form.dropoff_lng} onChange={handleChange} className="w-full px-3 py-2 border rounded text-sm" required />
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <select name="charge_payer" value={form.charge_payer} onChange={handleChange} className="px-3 py-2 border rounded text-sm">
                <option value="sender">Sender pays</option>
                <option value="receiver">Receiver pays</option>
              </select>
              <button type="submit" disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm">
                {submitting ? 'Creating...' : 'Create Delivery'}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">All Deliveries</h2>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded text-sm">
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="assigned">Assigned</option>
              <option value="picked_up">Picked Up</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {loading && <p className="text-gray-500 text-sm">Loading...</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {!loading && deliveries.length === 0 && (
            <p className="text-gray-500 text-sm">No deliveries found.</p>
          )}

          {deliveries.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Tracking #</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Reference</th>
                  <th className="pb-2">Created</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id} className="border-b last:border-0">
                    <td className="py-3">{d.tracking_number}</td>
                    <td className="py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 capitalize">{d.status.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3">{d.third_party_reference_id || '-'}</td>
                    <td className="py-3">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td className="py-3">
                      {!['picked_up', 'delivered', 'cancelled'].includes(d.status) && (
                        <button onClick={() => handleCancel(d.id)} className="text-red-600 hover:underline text-xs">
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
