import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function AdminApprovalRequests() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = () => {
    setLoading(true);
    api.get('/admin/approval-requests')
      .then((res) => setCompanies(res.data.companies))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRequests(); }, []);

  const handleDownload = async (docId, filename) => {
    const response = await api.get(`/admin/documents/${docId}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDocReview = async (docId, action) => {
    const note = prompt(`Add a note for this ${action} (optional):`) || '';
    await api.patch(`/admin/documents/${docId}/${action}`, { note });
    loadRequests();
  };

  const handleCompanyAction = async (id, action) => {
    await api.patch(`/admin/companies/${id}/${action}`);
    loadRequests();
  };

  const docStatusColor = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Approval Requests</h1>
        <p className="text-sm text-gray-500 mb-6">
          New companies awaiting review before they can operate on the platform.
        </p>

        {loading && <p className="text-gray-500 text-sm">Loading...</p>}
        {!loading && companies.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500 text-sm">
            No pending approval requests.
          </div>
        )}

        <div className="space-y-6">
          {companies.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="font-bold text-lg">{c.business_name}</h2>
                  <p className="text-sm text-gray-500">{c.user?.name} &middot; {c.user?.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Applied {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-x-2">
                  <button onClick={() => handleCompanyAction(c.id, 'approve')} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700">
                    Approve Company
                  </button>
                  <button onClick={() => handleCompanyAction(c.id, 'reject')} className="bg-red-600 text-white px-3 py-1.5 rounded text-xs hover:bg-red-700">
                    Reject Company
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-gray-500 mb-2">Uploaded Documents</h3>
              {c.documents.length === 0 ? (
                <p className="text-sm text-gray-400">No documents uploaded yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2">File</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.documents.map((doc) => (
                      <tr key={doc.id} className="border-b last:border-0">
                        <td className="py-2">{doc.original_name}</td>
                        <td className="py-2 capitalize">{doc.type.replace('_', ' ')}</td>
                        <td className="py-2">
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${docStatusColor[doc.status]}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-2 space-x-2">
                          <button onClick={() => handleDownload(doc.id, doc.original_name)} className="text-blue-600 hover:underline text-xs">
                            View
                          </button>
                          {doc.status === 'pending' && (
                            <>
                              <button onClick={() => handleDocReview(doc.id, 'approve')} className="text-green-600 hover:underline text-xs">
                                Approve Doc
                              </button>
                              <button onClick={() => handleDocReview(doc.id, 'reject')} className="text-red-600 hover:underline text-xs">
                                Reject Doc
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
