import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const links = [
  { label: 'Dashboard', path: '/admin', icon: '🏠' },
  { label: 'Companies', path: '/admin/companies', icon: '🤝' },
  { label: 'Deliveries', path: '/admin/deliveries', icon: '📦' },
  { label: 'Audit Log', path: '/admin/audit-log', icon: '📋' },
  { label: 'Analytics', path: '/admin/analytics', icon: '📈' },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col fixed left-0 top-0">
      <div className="p-6 text-xl font-bold border-b border-gray-800">
        Delivery Portal
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <div
            key={link.label}
            onClick={() => navigate(link.path)}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition ${
              location.pathname === link.path ? 'bg-gray-800' : 'hover:bg-gray-800'
            }`}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
