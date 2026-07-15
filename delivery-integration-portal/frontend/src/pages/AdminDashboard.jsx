import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data)).catch(() => {});
  }, []);

  const cards = stats ? [
    { label: 'Total Companies', value: stats.total_companies, color: 'bg-blue-500' },
    { label: 'Pending Approval', value: stats.pending_companies, color: 'bg-yellow-500' },
    { label: 'Total Deliveries', value: stats.total_deliveries, color: 'bg-purple-500' },
    { label: 'Active Deliveries', value: stats.active_deliveries, color: 'bg-orange-500' },
  ] : [];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-md p-6">
              <div className={`w-10 h-10 rounded-lg ${stat.color} mb-4`}></div>
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
