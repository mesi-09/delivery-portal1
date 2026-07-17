import { useEffect, useState } from 'react';
import api from '../services/api';

// Self-contained: fetches its own data, renders nothing while loading or if
// the partner is active. Drop <PartnerStatusBanner /> as the first child
// inside each Company page's main content area (next to <CompanySidebar />).
//
// Confirmed from PartnerController::me(): returns { partner: { status, ... } }.
// Confirmed from AdminController: approveCompany/rejectCompany/suspendCompany
// only ever write `status` — there's no reason/admin_note field on Partner
// (rejection and suspension both land on the same 'suspended' status), so
// there's nothing to show beyond the status itself.

export default function PartnerStatusBanner() {
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/partner/me')
      .then(({ data }) => {
        if (!cancelled) setPartner(data.partner);
      })
      .catch(() => {
        // Fail silently — banner just won't show. The page's own data
        // fetching will surface any real auth/loading errors.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!partner || partner.status === 'active') return null;

  if (partner.status === 'pending') {
    return (
      <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg px-4 py-3 mb-6 flex items-start gap-2">
        <span>🟡</span>
        <p className="text-sm">
          Your account is pending admin approval. Some features are unavailable until you're approved.
        </p>
      </div>
    );
  }

  if (partner.status === 'suspended') {
    return (
      <div className="bg-red-50 border border-red-300 text-red-800 rounded-lg px-4 py-3 mb-6 flex items-start gap-2">
        <span>🔴</span>
        <p className="text-sm">
          Your account has been suspended. Contact support if you believe this is a mistake.
        </p>
      </div>
    );
  }

  return null;
}
