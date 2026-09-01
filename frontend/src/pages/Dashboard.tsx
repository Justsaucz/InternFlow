import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Users, 
  ArrowRight, 
  Building2, 
  Award, 
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'COMPANY_HR';
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

  if (!user) return <div className="p-8 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ── Welcome Hero Banner ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-sky-600 to-indigo-700 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-primary-500/15">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold backdrop-blur-md mb-4 uppercase tracking-wider border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            {user.role.replace('_', ' ')} PORTAL
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Welcome back, {user.name}! 👋
          </h2>
          <p className="mt-3 text-primary-50 text-sm sm:text-base leading-relaxed max-w-xl">
            Here's an overview of your active placements, recent updates, and pending workflows.
          </p>
        </div>
      </div>

      {/* ── Metric Stat Cards ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Key Metrics</h3>
          <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-primary-600" />
            Live data computed on-demand
          </span>
        </div>

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
      </div>

      {/* ── Quick Actions & Recent Activity ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions Card */}
        <div className="lg:col-span-1 bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                Shortcuts
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-6">Frequently used tools for your daily tasks.</p>
            
            <div className="space-y-3">
              {user.role === 'STUDENT' && (
                <>
                  <Link 
                    to="/dashboard/jobs" 
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-primary-50 hover:text-primary-700 transition-all font-semibold text-sm text-slate-700 border border-slate-100 group"
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      Browse Internships
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link 
                    to="/dashboard/profile" 
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-primary-50 hover:text-primary-700 transition-all font-semibold text-sm text-slate-700 border border-slate-100 group"
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                      Edit Profile & Skills
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link 
                    to="/dashboard/applications" 
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-primary-50 hover:text-primary-700 transition-all font-semibold text-sm text-slate-700 border border-slate-100 group"
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      My Applications
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </>
              )}

              {user.role === 'COMPANY_HR' && (
                <>
                  <Link 
                    to="/dashboard/jobs/manage" 
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 transition-all font-semibold text-sm text-slate-700 border border-slate-100 group"
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      Post New Internship
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link 
                    to="/dashboard/applicants" 
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 transition-all font-semibold text-sm text-slate-700 border border-slate-100 group"
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      Review Applicant CVs
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </>
              )}


            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200/80">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest actions across your pipeline</p>
            </div>
            <span className="text-xs font-bold text-primary-700 bg-primary-50 border border-primary-100 px-3 py-1 rounded-full">
              Real-time Feed
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading activity feed...</div>
          ) : recent.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recent.map((item: any, i: number) => (
                <div key={i} className="py-4 flex items-center justify-between group hover:bg-slate-50/50 rounded-xl px-2 transition-colors">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary-600 font-black text-sm border border-slate-200 shadow-2xs">
                      {item.jobPost?.title?.charAt(0) || item.student?.user?.name?.charAt(0) || '•'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {item.jobPost?.title || item.student?.user?.name || 'Application Update'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.jobPost?.company?.companyName || item.student?.user?.email || 'Processed'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 text-sm">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
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
      case 2: return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      default: return <Building2 className="w-6 h-6 text-primary-600" />;
    }
  };

  const getBg = (i: number) => {
    switch (i) {
      case 0: return 'bg-blue-50 text-blue-600 border-blue-100';
      case 1: return 'bg-amber-50 text-amber-600 border-amber-100';
      case 2: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-primary-50 text-primary-600 border-primary-100';
    }
  };

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200/80 flex items-center justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all group">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{title}</p>
        <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xs group-hover:scale-110 transition-transform ${getBg(index)}`}>
        {getIcon(index)}
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 animate-pulse flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-slate-200 rounded"></div>
        <div className="h-8 w-12 bg-slate-200 rounded"></div>
      </div>
      <div className="w-14 h-14 bg-slate-100 rounded-2xl"></div>
    </div>
  );
}

