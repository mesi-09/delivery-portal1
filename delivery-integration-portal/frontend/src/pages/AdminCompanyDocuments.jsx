import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function AdminCompanyDocuments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDocuments = () => {
    setLoading(true);
    api.get(`/admin/companies/${id}/documents`)
      .then((res) => setDocuments(res.data.documents))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDocuments(); }, [id]);

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

  const handleReview = async (docId, action) => {
    const note = prompt(`Add a note for this ${action} (optional):`) || '';
    await api.patch(`/admin/documents/${docId}/${action}`, { note });
    loadDocuments();
  };

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <button onClick={() => navigate('/admin/companies')} className="text-sm text-blue-600 mb-4">
          &larr; Back to Companies
        </button>
        <h1 className="text-3xl font-bold mb-6">Company Documents</h1>

        <div className="bg-white rounded-xl shadow-md p-6">
          {loading && <p className="text-gray-500 text-sm">Loading...</p>}
          {!loading && documents.length === 0 && <p className="text-gray-500 text-sm">No documents uploaded by this company.</p>}

          {documents.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">File</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Note</th>
                  <th className="pb-2">Uploaded</th>
                  <th className="pb-2">Actions</th>
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
                    <td className="py-3 space-x-2">
                      <button onClick={() => handleDownload(doc.id, doc.original_name)} className="text-blue-600 hover:underline text-xs">
                        View/Download
                      </button>
                      {doc.status === 'pending' && (
                        <>
                          <button onClick={() => handleReview(doc.id, 'approve')} className="text-green-600 hover:underline text-xs">
                            Approve
                          </button>
                          <button onClick={() => handleReview(doc.id, 'reject')} className="text-red-600 hover:underline text-xs">
                            Reject
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
      </main>
    </div>
  );
}
