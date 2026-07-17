import { useEffect, useState } from 'react';
import api from '../services/api';

export default function CompanyStatusBanner() {
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    api.get('/partner/me')
      .then((res) => setPartner(res.data.partner))
      .catch(() => {});
  }, []);

  if (!partner || partner.status === 'active') {
    return null;
  }

  if (partner.status === 'pending') {
    return (
      <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg p-4 mb-6 text-sm">
        <p className="font-semibold">Your account is pending admin approval.</p>
        <p>Some features (like generating live API keys) will be unavailable until your company and documents are approved.</p>
      </div>
    );
  }

  if (partner.status === 'suspended') {
    return (
      <div className="bg-red-50 border border-red-300 text-red-800 rounded-lg p-4 mb-6 text-sm">
        <p className="font-semibold">Your account has been suspended or rejected.</p>
        <p>Please contact support for more information.</p>
      </div>
    );
  }

  return null;
}
