import { useEffect, useState } from 'react';
import CompanySidebar from '../components/CompanySidebar';
import CompanyStatusBanner from '../components/CompanyStatusBanner';
import api from '../services/api';

export default function CompanyDocuments() {
  const [documents, setDocuments] = useState([]);
  const [docFile, setDocFile] = useState(null);
  const [docType, setDocType] = useState('business_license');
  const [docError, setDocError] = useState('');
  const [docUploading, setDocUploading] = useState(false);

  const loadDocuments = () => {
    api.get('/partner/documents')
      .then((res) => setDocuments(res.data.documents))
      .catch(() => {});
  };

  useEffect(() => { loadDocuments(); }, []);

  const handleDocUpload = async (e) => {
    e.preventDefault();
    setDocError('');
    if (!docFile) {
      setDocError('Please choose a file first.');
      return;
    }
    setDocUploading(true);
    const formData = new FormData();
    formData.append('file', docFile);
    formData.append('type', docType);
    try {
      await api.post('/partner/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDocFile(null);
      e.target.reset();
      loadDocuments();
    } catch (err) {
      setDocError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setDocUploading(false);
    }
  };

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <CompanySidebar />
      <main className="ml-64 flex-1 p-8">
        <CompanyStatusBanner />
        <h1 className="text-3xl font-bold mb-6">Verification Documents</h1>

        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-500 mb-4">
            Upload your business license, tax certificate, or ID document (PDF, JPG, or PNG, max 10MB) for admin review.
            Your company must have at least one approved document to be fully activated.
          </p>

          <form onSubmit={handleDocUpload} className="flex gap-3 mb-6 items-center">
            <select value={docType} onChange={(e) => setDocType(e.target.value)} className="px-3 py-2 border rounded text-sm">
              <option value="business_license">Business License</option>
              <option value="tax_certificate">Tax Certificate</option>
              <option value="id_document">ID Document</option>
              <option value="other">Other</option>
            </select>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setDocFile(e.target.files[0])}
              className="flex-1 text-sm"
            />
            <button type="submit" disabled={docUploading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm disabled:opacity-50">
              {docUploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
          {docError && <p className="text-red-500 text-sm mb-4">{docError}</p>}

          {documents.length > 0 && (
            <button
              onClick={() => alert("Your documents are visible to the admin team and will be reviewed shortly. No further action needed.")}
              className="mb-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm flex items-center gap-2"
            >
              <span>Notify Admin for Review</span>
            </button>
          )}

          {documents.length === 0 ? (
            <p className="text-gray-500 text-sm">No documents uploaded yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">File</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Admin Note</th>
                  <th className="pb-2">Uploaded</th>
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
