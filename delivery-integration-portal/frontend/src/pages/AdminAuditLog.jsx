import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/audit-logs')
      .then((res) => setLogs(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const actionLabels = {
    'company.approved': 'Approved company',
    'company.rejected': 'Rejected company',
    'company.suspended': 'Suspended company',
    'company.rate_limit_updated': 'Updated rate limit',
    'delivery.status_overridden': 'Overrode delivery status',
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Audit Log</h1>

        <div className="bg-white rounded-xl shadow-md p-6">
          {loading && <p className="text-gray-500 text-sm">Loading...</p>}
          {!loading && logs.length === 0 && <p className="text-gray-500 text-sm">No audit log entries yet.</p>}

          {logs.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Admin</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Target</th>
                  <th className="pb-2">Details</th>
                  <th className="pb-2">When</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="py-3">{log.admin?.name}<br /><span className="text-xs text-gray-500">{log.admin?.email}</span></td>
                    <td className="py-3">{actionLabels[log.action] || log.action}</td>
                    <td className="py-3">{log.target_type} #{log.target_id}</td>
                    <td className="py-3 text-xs text-gray-500">
                      {log.details && Object.entries(log.details).map(([k, v]) => (
                        <div key={k}>{k}: {String(v)}</div>
                      ))}
                    </td>
                    <td className="py-3 text-xs">{new Date(log.created_at).toLocaleString()}</td>
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
