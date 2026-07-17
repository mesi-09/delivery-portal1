import { useEffect, useState } from 'react';
import CompanySidebar from '../components/CompanySidebar';
import CompanyStatusBanner from '../components/CompanyStatusBanner';
import PartnerStatusBanner from '../components/PartnerStatusBanner';
import api from '../services/api';

export default function CompanyDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/partner/dashboard')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Success Rate', value: `${stats.success_rate}%`, color: 'bg-green-500' },
    { label: 'Active Deliveries', value: stats.active_deliveries, color: 'bg-blue-500' },
    { label: 'Completed Deliveries', value: stats.completed_deliveries, color: 'bg-purple-500' },
    { label: 'Total Deliveries', value: stats.total_deliveries, color: 'bg-orange-500' },
  ] : [];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <CompanySidebar />
      <main className="ml-64 flex-1 p-8">
        <CompanyStatusBanner />
        <h1 className="text-3xl font-bold mb-8">Company Dashboard</h1>
        <PartnerStatusBanner />

        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {cards.map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl shadow-md p-6">
                  <div className={`w-10 h-10 rounded-lg ${stat.color} mb-4`}></div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
              {stats.recent_activity.length === 0 ? (
                <p className="text-gray-500 text-sm">No deliveries yet.</p>
              ) : (
                <div className="space-y-3">
                  {stats.recent_activity.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">#{item.tracking_number}</p>
                        <p className="text-xs text-gray-500">{new Date(item.updated_at).toLocaleString()}</p>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-gray-100 capitalize">
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}