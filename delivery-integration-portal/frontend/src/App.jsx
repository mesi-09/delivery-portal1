import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminCompanies from './pages/AdminCompanies';
import AdminCompanyDocuments from './pages/AdminCompanyDocuments';
import AdminDeliveries from './pages/AdminDeliveries';
import AdminAuditLog from './pages/AdminAuditLog';
import AdminAnalytics from './pages/AdminAnalytics';
import TrackDelivery from './pages/TrackDelivery';
import CompanyOnboarding from './pages/CompanyOnboarding';
import CompanyDashboard from './pages/CompanyDashboard';
import CompanyDeliveries from './pages/CompanyDeliveries';
import CompanySettings from './pages/CompanySettings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/track" element={<TrackDelivery />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/companies" element={<ProtectedRoute><AdminCompanies /></ProtectedRoute>} />
          <Route path="/admin/companies/:id/documents" element={<ProtectedRoute><AdminCompanyDocuments /></ProtectedRoute>} />
          <Route path="/admin/deliveries" element={<ProtectedRoute><AdminDeliveries /></ProtectedRoute>} />
          <Route path="/admin/audit-log" element={<ProtectedRoute><AdminAuditLog /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/company/onboarding" element={<ProtectedRoute><CompanyOnboarding /></ProtectedRoute>} />
          <Route path="/company/dashboard" element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
          <Route path="/company/deliveries" element={<ProtectedRoute><CompanyDeliveries /></ProtectedRoute>} />
          <Route path="/company/settings" element={<ProtectedRoute><CompanySettings /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
