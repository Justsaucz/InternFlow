import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, CheckCircle, Clock, Users, ArrowRight, Building, Award } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'COMPANY_HR' | 'UNIVERSITY_ADMIN';
}

interface StatItem {
  label: string;
  value: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchDashboardStats();
    }
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || []);
        setRecent(data.recent || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-4 uppercase tracking-wider">
            {user.role.replace('_', ' ')}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Welcome back, {user.name}! 👋
          </h2>
          <p className="mt-2 text-primary-100 text-base">
            Here's what's happening with your internship pipeline today.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10">
          <GraduationIcon className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          stats.map((stat, idx) => (
            <StatCard 
              key={idx} 
              title={stat.label} 
              value={stat.value} 
              index={idx}
            />
          ))
        )}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Role Action Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Actions</h3>
            <p className="text-sm text-gray-500 mb-6">Common workflows for your daily tasks.</p>
            
            <div className="space-y-3">
              {user.role === 'STUDENT' && (
                <>
                  <Link to="/dashboard/jobs" className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-primary-50 hover:text-primary-700 transition-colors font-medium text-sm text-gray-700">
                    <span className="flex items-center"><Briefcase className="w-4 h-4 mr-2.5 text-primary-600" /> Browse Internships</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                  <Link to="/dashboard/profile" className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-primary-50 hover:text-primary-700 transition-colors font-medium text-sm text-gray-700">
                    <span className="flex items-center"><Award className="w-4 h-4 mr-2.5 text-primary-600" /> Update Resume & Skills</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                  <Link to="/dashboard/applications" className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-primary-50 hover:text-primary-700 transition-colors font-medium text-sm text-gray-700">
                    <span className="flex items-center"><FileText className="w-4 h-4 mr-2.5 text-primary-600" /> Track Application Status</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                </>
              )}

              {user.role === 'COMPANY_HR' && (
                <>
                  <Link to="/dashboard/jobs/manage" className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-primary-50 hover:text-primary-700 transition-colors font-medium text-sm text-gray-700">
                    <span className="flex items-center"><Briefcase className="w-4 h-4 mr-2.5 text-primary-600" /> Post New Job</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                  <Link to="/dashboard/applicants" className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-primary-50 hover:text-primary-700 transition-colors font-medium text-sm text-gray-700">
                    <span className="flex items-center"><Users className="w-4 h-4 mr-2.5 text-primary-600" /> Review Candidate CVs</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                </>
              )}

              {user.role === 'UNIVERSITY_ADMIN' && (
                <>
                  <Link to="/dashboard/approvals" className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-primary-50 hover:text-primary-700 transition-colors font-medium text-sm text-gray-700">
                    <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2.5 text-primary-600" /> Pending Approvals</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                  <Link to="/dashboard/students" className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-primary-50 hover:text-primary-700 transition-colors font-medium text-sm text-gray-700">
                    <span className="flex items-center"><Users className="w-4 h-4 mr-2.5 text-primary-600" /> Student Directory</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recent Items List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
              Live Updates
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-400">Loading activity...</div>
          ) : recent.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recent.map((item: any, i: number) => (
                <div key={i} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-primary-600 font-bold text-sm border border-gray-100">
                      {item.jobPost?.title?.charAt(0) || item.student?.user?.name?.charAt(0) || '•'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {item.jobPost?.title || item.student?.user?.name || 'Application Update'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.jobPost?.company?.companyName || item.student?.user?.email || 'Processed'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">
              No recent activity recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, index }: { title: string; value: number; index: number }) {
  const getIcon = (i: number) => {
    switch (i) {
      case 0: return <Briefcase className="w-6 h-6 text-blue-600" />;
      case 1: return <Clock className="w-6 h-6 text-amber-600" />;
      case 2: return <CheckCircle className="w-6 h-6 text-emerald-600" />;
      default: return <Building className="w-6 h-6 text-primary-600" />;
    }
  };

  const getBg = (i: number) => {
    switch (i) {
      case 0: return 'bg-blue-50';
      case 1: return 'bg-amber-50';
      case 2: return 'bg-emerald-50';
      default: return 'bg-primary-50';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-extrabold text-gray-900">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getBg(index)}`}>
        {getIcon(index)}
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-gray-200 rounded"></div>
        <div className="h-8 w-12 bg-gray-200 rounded"></div>
      </div>
      <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
    </div>
  );
}

function GraduationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" />
    </svg>
  );
}
