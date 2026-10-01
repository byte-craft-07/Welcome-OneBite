import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Link2,
  Clock,
  Palette,
  QrCode,
  BarChart3,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Building2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AdminLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, activeBusinessId } = useAuth();
  const { info } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    info('Logged out successfully');
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Business Profile', path: '/admin/profile', icon: Store },
    { label: 'Links Management', path: '/admin/links', icon: Link2 },
    { label: 'Business Hours', path: '/admin/hours', icon: Clock },
    { label: 'Appearance & Themes', path: '/admin/appearance', icon: Palette },
    { label: 'QR Code Studio', path: '/admin/qr', icon: QrCode },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  const currentBusinessSlug = user?.businesses?.[0]?.slug || 'onebite-bakery';
  const currentBusinessName = user?.businesses?.[0]?.name || 'OneBite Bakery';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-500/20">
            BLH
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-tight">Admin Panel</h1>
            <p className="text-[11px] text-orange-400 font-medium truncate max-w-[150px]">{currentBusinessName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/${currentBusinessSlug}`}
            target="_blank"
            className="p-2 text-stone-300 hover:text-white bg-slate-800/80 rounded-lg text-xs flex items-center gap-1.5"
            title="Preview Live Page"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-300 hover:text-white bg-slate-800/80 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 md:z-auto w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Logo & Title */}
        <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                LinkHub
                <span className="text-[10px] bg-orange-500/20 text-orange-400 font-mono px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              </h2>
              <p className="text-xs text-slate-400">Business Management</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Business Badge */}
        <div className="px-4 py-3 bg-slate-900/60 mx-3 my-3 rounded-xl border border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Building2 className="w-4 h-4 text-orange-400 shrink-0" />
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">{currentBusinessName}</p>
              <p className="text-[10px] text-slate-500 truncate">/{currentBusinessSlug}</p>
            </div>
          </div>
          <Link
            to={`/${currentBusinessSlug}`}
            target="_blank"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-orange-400 rounded-lg transition-colors shrink-0"
            title="Open Live Profile"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/90'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer with User info and Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
          <div className="flex items-center justify-between px-2 py-1.5 mb-2">
            <div className="truncate">
              <p className="text-xs font-medium text-slate-300 truncate">
                {user?.email || 'admin@businesslinkhub.local'}
              </p>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PIN: 753753 active
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/${currentBusinessSlug}`}
              target="_blank"
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700/60 flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
              <span>Live Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/50 hover:text-rose-400 text-xs font-semibold text-slate-400 border border-slate-700/60 flex items-center justify-center gap-1.5 transition-colors"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-y-auto">
        {/* Desktop Top Bar */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 bg-slate-950/70 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400">
              Workspace &gt; <span className="text-slate-200 font-semibold">{currentBusinessName}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/${currentBusinessSlug}`}
              target="_blank"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-semibold shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Page</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Nested Route Content */}
        <div className="p-4 md:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
