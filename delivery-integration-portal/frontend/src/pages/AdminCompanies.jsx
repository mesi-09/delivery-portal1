import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const loadCompanies = () => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : {};
    api.get('/admin/companies', { params })
      .then((res) => setCompanies(res.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCompanies(); }, [statusFilter]);

  const handleAction = async (id, action) => {
    await api.patch(`/admin/companies/${id}/${action}`);
    loadCompanies();
  };

  const handleRateLimit = async (id, value) => {
    try {
      await api.patch(`/admin/companies/${id}/rate-limit`, { rate_limit_per_minute: parseInt(value) });
      loadCompanies();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update rate limit');
    }
  };

  const handleImpersonate = async (id, businessName) => {
    if (!confirm(`Impersonate ${businessName}? This will be logged in the audit trail.`)) return;
    try {
      const { data } = await api.post(`/admin/companies/${id}/impersonate`);
      alert(`Impersonation token for ${data.user.email}:\n\n${data.token}\n\nCopy this token to act as this user.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to impersonate');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Companies</h1>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded text-sm">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          {loading && <p className="text-gray-500 text-sm">Loading...</p>}
          {!loading && companies.length === 0 && <p className="text-gray-500 text-sm">No companies found.</p>}

          {companies.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Business Name</th>
                  <th className="pb-2">Owner</th>
                  <th className="pb-2">Deliveries</th>
                  <th className="pb-2">Rate Limit/min</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-3">{c.business_name}</td>
                    <td className="py-3">{c.user?.name}<br /><span className="text-xs text-gray-500">{c.user?.email}</span></td>
                    <td className="py-3">{c.deliveries_count}</td>
                    <td className="py-3">
                      <input
                        type="number"
                        defaultValue={c.rate_limit_per_minute}
                        onBlur={(e) => handleRateLimit(c.id, e.target.value)}
                        className="w-20 px-2 py-1 border rounded text-xs"
                      />
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                        c.status === 'active' ? 'bg-green-100 text-green-700' :
                        c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 space-x-2">
                      <button onClick={() => handleImpersonate(c.id, c.business_name)} className="text-purple-600 hover:underline text-xs">Impersonate</button>
                      {c.status === 'pending' && (
                        <>
                          <button onClick={() => handleAction(c.id, 'approve')} className="text-green-600 hover:underline text-xs">Approve</button>
                          <button onClick={() => handleAction(c.id, 'reject')} className="text-red-600 hover:underline text-xs">Reject</button>
                        </>
                      )}
                      {c.status === 'active' && (
                        <button onClick={() => handleAction(c.id, 'suspend')} className="text-red-600 hover:underline text-xs">Suspend</button>
                      )}
                      {c.status === 'suspended' && (
                        <button onClick={() => handleAction(c.id, 'approve')} className="text-green-600 hover:underline text-xs">Reactivate</button>
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
