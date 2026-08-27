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
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'COMPANY_HR' | 'UNIVERSITY_ADMIN';
}

export default function DashboardLayout() {
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

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
        return { label: 'Student', icon: GraduationCap, color: 'bg-primary-50 text-primary-700 border-primary-200' };
      case 'COMPANY_HR':
        return { label: 'Company HR', icon: Building2, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'UNIVERSITY_ADMIN':
        return { label: 'University Admin', icon: ShieldCheck, color: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: 'User', icon: User, color: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };

  const roleInfo = getRoleBadge();
  const RoleIcon = roleInfo.icon;

  const getNavigation = () => {
    switch (user.role) {
      case 'STUDENT':
        return [
          { name: 'Dashboard', href: '/dashboard', icon: Home },
          { name: 'Find Internships', href: '/dashboard/jobs', icon: Briefcase },
          { name: 'My Applications', href: '/dashboard/applications', icon: FileText },
          { name: 'My Profile', href: '/dashboard/profile', icon: User },
        ];
      case 'COMPANY_HR':
        return [
          { name: 'Dashboard', href: '/dashboard', icon: Home },
          { name: 'Job Postings', href: '/dashboard/jobs/manage', icon: Briefcase },
          { name: 'Applicants', href: '/dashboard/applicants', icon: Users },
        ];
      case 'UNIVERSITY_ADMIN':
        return [
          { name: 'Dashboard', href: '/dashboard', icon: Home },
          { name: 'Students', href: '/dashboard/students', icon: Users },
          { name: 'Approval Requests', href: '/dashboard/approvals', icon: FileText },
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
      <aside className="w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between shadow-xs z-20">
        <div>
          {/* Brand Logo Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 leading-tight">
                  Intern<span className="text-primary-600">Flow</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Workspace</span>
              </div>
            </Link>
          </div>

          {/* User Role Card */}
          <div className="p-4 mx-4 mt-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-2xs border border-slate-200 text-primary-600">
                <RoleIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
                <span className={`inline-flex items-center text-[10px] font-semibold mt-0.5 px-2 py-0.2 rounded-full border ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              </div>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" title="Online"></span>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-6 space-y-1.5">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Main Menu</p>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center justify-between px-3.5 py-3 text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {item.name}
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer & Logout */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 font-medium">Portal</span>
            <span className="text-slate-300">/</span>
            <h1 className="text-lg font-bold text-slate-900">
              {currentNav?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary-600" />
              InternFlow v1.0
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

