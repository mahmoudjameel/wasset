import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  Wallet,
  Link as LinkIcon,
  HeadphonesIcon,
  Settings,
  LogOut,
  Menu,
  X,
  Sliders
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { path: '/transactions', icon: FileText, label: 'المعاملات' },
    { path: '/users', icon: Users, label: 'المستخدمين' },
    { path: '/wallet', icon: Wallet, label: 'المحفظة' },
    { path: '/payment-links', icon: LinkIcon, label: 'روابط الدفع' },
    { path: '/feature-flags', icon: Sliders, label: 'إعدادات الميزات' },
    { path: '/support', icon: HeadphonesIcon, label: 'الدعم الفني' },
    { path: '/settings', icon: Settings, label: 'الإعدادات' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#001731] mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full bg-white border-l border-gray-200 transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-[#001731]">وسيط مصر</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#001731] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 mt-8 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'mr-64' : 'mr-0'}`}>
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Menu size={24} />
                </button>
              )}
              <h2 className="text-xl font-bold text-[#001731]">
                {menuItems.find((item) => item.path === location.pathname)?.label || 'لوحة التحكم'}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {currentUser?.email}
                </p>
                <p className="text-xs text-gray-500">مدير النظام</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#001731] flex items-center justify-center text-white font-bold">
                {currentUser?.email?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
