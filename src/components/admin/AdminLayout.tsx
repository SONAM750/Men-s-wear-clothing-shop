import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ClipboardList,
  Tag,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useShopSettings } from '@/context/ShopSettingsContext';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Stock Management', path: '/admin/stock', icon: Boxes },
  { label: 'Orders', path: '/admin/orders', icon: ClipboardList },
  { label: 'Categories', path: '/admin/categories', icon: Tag },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
  const { signOut } = useAuth();
  const { settings } = useShopSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2 px-6 py-5 border-b border-primary-800">
        <div className="w-9 h-9 rounded-lg bg-accent-500 flex items-center justify-center">
          <Store className="w-5 h-5 text-primary-950" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-lg text-white tracking-wide truncate">
            {settings?.shop_name || 'Sachdeva Mens Wear'}
          </p>
          <p className="text-xs text-primary-400">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-accent-500 text-primary-950'
                  : 'text-primary-300 hover:bg-primary-800 hover:text-white',
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-primary-800 space-y-1">
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-300 hover:bg-primary-800 hover:text-white transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          View Store
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-300 hover:bg-error-600 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-primary-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-primary-950 flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-primary-950/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-primary-950 flex flex-col animate-slide-in-right">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-primary-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-primary-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-primary-700 hover:bg-primary-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display text-lg text-primary-900">Admin</span>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
