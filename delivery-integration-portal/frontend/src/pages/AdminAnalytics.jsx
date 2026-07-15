import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/analytics').then((res) => setData(res.data)).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <p className="text-gray-500 text-sm">Loading...</p>
        </main>
      </div>
    );
  }

  const cards = [
    { label: 'Total Requests', value: data.total_requests, color: 'bg-blue-500' },
    { label: 'Success (2xx)', value: data.success_count, color: 'bg-green-500' },
    { label: 'Client Errors (4xx)', value: data.client_error_count, color: 'bg-yellow-500' },
    { label: 'Server Errors (5xx)', value: data.server_error_count, color: 'bg-red-500' },
    { label: 'Avg Response Time', value: `${data.avg_response_time_ms}ms`, color: 'bg-purple-500' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 space-y-8">
        <h1 className="text-3xl font-bold">API Analytics</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {cards.map((c) => (
            <div key={c.label} className="bg-white rounded-xl shadow-md p-6">
              <div className={`w-10 h-10 rounded-lg ${c.color} mb-4`}></div>
              <p className="text-gray-500 text-sm">{c.label}</p>
              <p className="text-2xl font-bold mt-1">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-bold mb-4">Requests by Company</h2>
          {data.by_partner.length === 0 && <p className="text-gray-500 text-sm">No data yet.</p>}
          {data.by_partner.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Company</th>
                  <th className="pb-2">Requests</th>
                  <th className="pb-2">Avg Response Time</th>
                </tr>
              </thead>
              <tbody>
                {data.by_partner.map((p) => (
                  <tr key={p.partner_id} className="border-b last:border-0">
                    <td className="py-3">{p.partner?.business_name}</td>
                    <td className="py-3">{p.request_count}</td>
                    <td className="py-3">{Math.round(p.avg_response_time)}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-bold mb-4">Recent Requests</h2>
          {data.recent_requests.length === 0 && <p className="text-gray-500 text-sm">No requests logged yet.</p>}
          {data.recent_requests.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Method</th>
                  <th className="pb-2">Path</th>
                  <th className="pb-2">Company</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Time</th>
                  <th className="pb-2">When</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_requests.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-3">{r.method}</td>
                    <td className="py-3 font-mono text-xs">{r.path}</td>
                    <td className="py-3">{r.partner?.business_name || '-'}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        r.status_code < 300 ? 'bg-green-100 text-green-700' :
                        r.status_code < 500 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {r.status_code}
                      </span>
                    </td>
                    <td className="py-3">{r.response_time_ms}ms</td>
                    <td className="py-3 text-xs">{new Date(r.created_at).toLocaleString()}</td>
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
