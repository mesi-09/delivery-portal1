import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function AdminDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const loadDeliveries = () => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : {};
    api.get('/admin/deliveries', { params })
      .then((res) => setDeliveries(res.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDeliveries(); }, [statusFilter]);

  const handleOverride = async (id) => {
    const status = prompt('Enter new status (pending, accepted, assigned, picked_up, delivered, cancelled):');
    if (!status) return;
    try {
      await api.patch(`/admin/deliveries/${id}/override-status`, { status });
      loadDeliveries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to override status');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All Deliveries</h1>
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

        <div className="bg-white rounded-xl shadow-md p-6">
          {loading && <p className="text-gray-500 text-sm">Loading...</p>}
          {!loading && deliveries.length === 0 && <p className="text-gray-500 text-sm">No deliveries found.</p>}

          {deliveries.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Tracking #</th>
                  <th className="pb-2">Company</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Created</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id} className="border-b last:border-0">
                    <td className="py-3">{d.tracking_number}</td>
                    <td className="py-3">{d.partner?.business_name}</td>
                    <td className="py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 capitalize">{d.status.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td className="py-3">
                      <button onClick={() => handleOverride(d.id)} className="text-blue-600 hover:underline text-xs">Override Status</button>
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
