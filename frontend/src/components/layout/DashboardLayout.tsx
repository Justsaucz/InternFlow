import { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, FileText, User, LogOut, Users } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-2xl font-bold text-primary-600">InternFlow</span>
        </div>
        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-700' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-500 truncate w-32">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
          <h1 className="text-xl font-semibold text-gray-800">
            {navigation.find((item) => item.href === location.pathname)?.name || 'Dashboard'}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
