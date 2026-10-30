import { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Briefcase, 
  FileText, 
  User, 
  LogOut, 
  Users, 
  GraduationCap, 
  Building2, 
  ChevronRight,
  Sparkles,
  BookOpen,
  Award
} from 'lucide-react';
import { useLanguage, LanguageSwitcher } from '../../context/LanguageContext';

interface UserData {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: 'STUDENT' | 'COMPANY_HR';
}

export default function DashboardLayout() {
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getRoleBadge = () => {
    switch (user.role) {
      case 'STUDENT':
        return { label: t.nav.studentRole, icon: GraduationCap, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'COMPANY_HR':
        return { label: t.nav.companyRole, icon: Building2, color: 'bg-teal-50 text-teal-700 border-teal-200' };
      default:
        return { label: 'User', icon: User, color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const roleInfo = getRoleBadge();
  const RoleIcon = roleInfo.icon;

  const getNavigation = () => {
    switch (user.role) {
      case 'STUDENT':
        return [
          { name: t.nav.dashboard, href: '/dashboard', icon: Home },
          { name: t.nav.findInternships, href: '/dashboard/jobs', icon: Briefcase },
          { name: t.nav.myApplications, href: '/dashboard/applications', icon: FileText },
          { name: t.nav.weeklyLogbook, href: '/dashboard/logbook', icon: BookOpen },
          { name: t.nav.myProfile, href: '/dashboard/profile', icon: User },
        ];
      case 'COMPANY_HR':
        return [
          { name: t.nav.dashboard, href: '/dashboard', icon: Home },
          { name: t.nav.jobPostings, href: '/dashboard/jobs/manage', icon: Briefcase },
          { name: t.nav.applicants, href: '/dashboard/applicants', icon: Users },
          { name: t.nav.internEvaluations, href: '/dashboard/evaluations', icon: Award },
          { name: t.nav.companyProfile, href: '/dashboard/company/profile', icon: Building2 },
        ];
      default:
        return [];
    }
  };

  const navigation = getNavigation();
  const currentNav = navigation.find((item) => item.href === location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-900">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* App Brand Header */}
          <div className="p-6 pb-5 border-b border-slate-100">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-all font-black text-sm">
                IF
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 leading-tight font-heading">
                  Intern<span className="text-emerald-600">Flow</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.nav.workspace}</span>
              </div>
            </Link>
          </div>

          {/* User Role Card */}
          <div className="p-3.5 mx-4 mt-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-xs border border-slate-200 overflow-hidden text-emerald-600 flex-shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${user.avatarUrl}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <RoleIcon className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate">{user.name}</p>
                <span className={`inline-flex items-center text-[10px] font-bold mt-0.5 px-2 py-0.5 rounded-full border ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              </div>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0 shadow-xs shadow-emerald-500/50" title="Online" />
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-6 space-y-1.5">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">{t.nav.mainMenu}</p>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center justify-between px-3.5 py-3 text-sm font-semibold rounded-2xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 font-bold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {item.name}
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer & Logout */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            {t.nav.signOut}
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 font-medium">{t.nav.portal}</span>
            <span className="text-slate-300">/</span>
            <h1 className="text-lg font-bold text-slate-900 font-heading">
              {currentNav?.name || t.nav.dashboard}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              InternFlow Active
            </span>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
