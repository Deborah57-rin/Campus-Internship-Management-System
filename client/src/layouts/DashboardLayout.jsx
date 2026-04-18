/* eslint-disable react-hooks/static-components */
/* eslint-disable no-unused-vars */
import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DASHBOARD_MENUS } from '../config/dashboardMenus';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function roleLabel(role) {
  if (role === 'admin') return 'Internship Officer';
  if (role === 'lecturer') return 'Lecturer';
  return 'Student';
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role || 'student';
  const menuItems = useMemo(() => DASHBOARD_MENUS[role] || DASHBOARD_MENUS.student, [role]);

  const headerTitle = useMemo(() => {
    const found = menuItems.find((m) => location.pathname.startsWith(m.to));
    if (!found && role === 'student' && location.pathname.startsWith('/student/internship-contract')) {
      return 'Internship Contract';
    }
    return found?.label || 'Dashboard';
  }, [location.pathname, menuItems, role]);

  const handleLogout = async () => {
    await logout();
  };

  const goToDashboard = () => {
    const dash = role === 'admin' ? '/admin/dashboard' : role === 'lecturer' ? '/lecturer/dashboard' : '/student/dashboard';
    navigate(dash);
  };

  const SidebarNav = ({ onNavigate }) => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <button
          type="button"
          onClick={goToDashboard}
          className="flex items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-usiu-muted/60 focus:outline-none focus:ring-4 focus:ring-usiu-gold/20"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-usiu-navy/10 text-usiu-navy ring-1 ring-usiu-gold/30">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-slate-900">Internship Portal</span>
            <span className="block text-xs text-slate-500">{roleLabel(role)} Workspace</span>
          </span>
        </button>
      </div>

      <div className="px-3">
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Menu
        </p>
        <nav className="space-y-1">
          {menuItems.map(({ label, to, icon: IconComponent }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => onNavigate?.()}
              className={() => {
                const active = location.pathname === to || location.pathname.startsWith(`${to}/`);
                return classNames(
                  'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                  active
                    ? 'bg-usiu-navy text-white shadow-[inset_4px_0_0_#CDCB05,0_1px_2px_rgba(15,23,42,0.06)]'
                    : 'text-slate-700 hover:bg-usiu-muted/50 hover:text-slate-900'
                );
              }}
            >
              <IconComponent
                className={classNames(
                  'h-5 w-5 transition',
                  location.pathname === to || location.pathname.startsWith(`${to}/`)
                    ? 'text-white'
                    : 'text-slate-400 group-hover:text-slate-600'
                )}
              />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-slate-200 p-4">
        <div className="flex items-center justify-between gap-3 rounded-xl bg-usiu-muted/50 px-3 py-3 ring-1 ring-slate-200/80">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-900">{user?.name || 'User'}</p>
            <p className="truncate text-[11px] text-slate-500">{user?.email || ''}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-usiu-muted/40 focus:outline-none focus:ring-4 focus:ring-usiu-gold/30"
          >
            <LogOut className="h-4 w-4 text-usiu-gold" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-usiu-muted/40">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={classNames(
          'fixed inset-y-0 left-0 z-50 w-80 transform bg-white shadow-xl ring-1 ring-slate-200 transition lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-label="Sidebar"
      >
        <SidebarNav onNavigate={() => setMobileOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-80 bg-white shadow-sm ring-1 ring-slate-200 lg:block">
        <SidebarNav />
      </aside>

      {/* Main */}
      <div className="lg:pl-80">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-usiu-navy/10 lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold text-slate-900">{headerTitle}</h1>
                <p className="truncate text-xs text-slate-500">{roleLabel(role)}</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="rounded-full bg-usiu-navy/10 px-3 py-1 text-xs font-semibold text-usiu-navy ring-1 ring-usiu-gold/35">
                {user?.email || 'Signed in'}
              </span>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

