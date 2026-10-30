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
  TrendingUp,
  FileCheck2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
  const { t, formatDate } = useLanguage();

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

  const getTranslatedStatLabel = (originalLabel: string, role?: string, index?: number): string => {
    if (role === 'STUDENT') {
      if (originalLabel.includes('Sent') || originalLabel.includes('Applied') || index === 0) {
        return t.dashboard.studentStats.applied;
      }
      if (originalLabel.includes('Review') || index === 1) {
        return t.dashboard.studentStats.review;
      }
      if (originalLabel.includes('Approved') || originalLabel.includes('Offer') || index === 2) {
        return t.dashboard.studentStats.approved;
      }
    } else {
      if (originalLabel.includes('Job') || originalLabel.includes('Active') || index === 0) {
        return t.dashboard.companyStats.jobs;
      }
      if (originalLabel.includes('Applicant') || index === 1) {
        return t.dashboard.companyStats.applicants;
      }
      if (originalLabel.includes('Candidate') || originalLabel.includes('Accepted') || index === 2) {
        return t.dashboard.companyStats.evaluations;
      }
    }
    return originalLabel;
  };

  if (!user) return <div className="p-8 text-slate-500 font-medium">{t.common.loading}</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ── Welcome Hero Banner ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#062314] via-[#0b3820] to-[#04190e] rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-emerald-950/20 border border-emerald-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-300 backdrop-blur-md mb-4 uppercase tracking-wider border border-emerald-400/20">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            {user.role === 'STUDENT' ? t.nav.studentRole : t.nav.companyRole} {t.nav.workspace}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white font-heading">
            {t.dashboard.welcome}, {user.name}! 👋
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
            {user.role === 'STUDENT' ? t.dashboard.studentSubtitle : t.dashboard.companySubtitle}
          </p>
        </div>
      </div>

      {/* ── Metric Stat Cards ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 font-heading">{t.dashboard.keyMetrics}</h3>
          <span className="text-xs text-slate-500 flex items-center gap-1.5 font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            {t.dashboard.liveSync}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : stats.length > 0 ? (
            stats.map((stat, idx) => (
              <StatCard 
                key={idx} 
                title={getTranslatedStatLabel(stat.label, user.role, idx)} 
                value={stat.value} 
                index={idx}
              />
            ))
          ) : (
            // Default Demo Fallbacks if backend DB has zero records
            <>
              <StatCard title={user.role === 'STUDENT' ? t.dashboard.studentStats.applied : t.dashboard.companyStats.jobs} value={0} index={0} />
              <StatCard title={user.role === 'STUDENT' ? t.dashboard.studentStats.review : t.dashboard.companyStats.applicants} value={0} index={1} />
              <StatCard title={user.role === 'STUDENT' ? t.dashboard.studentStats.approved : t.dashboard.companyStats.evaluations} value={0} index={2} />
            </>
          )}
        </div>
      </div>

      {/* ── Quick Actions & Recent Activity ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions Card */}
        <div className="lg:col-span-1 bg-white p-6 sm:p-7 rounded-3xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-900 font-heading">{t.dashboard.quickActions}</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                {t.dashboard.shortcuts}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-6">{t.dashboard.quickActionsDesc}</p>
            
            <div className="space-y-3">
              {user.role === 'STUDENT' && (
                <>
                  <Link 
                    to="/dashboard/jobs" 
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 hover:border-emerald-300 transition-all font-semibold text-sm text-slate-700 border border-slate-200/70 group"
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      {t.dashboard.findInternships}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                  </Link>

                  <Link 
                    to="/dashboard/profile" 
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 hover:border-emerald-300 transition-all font-semibold text-sm text-slate-700 border border-slate-200/70 group"
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                      {t.dashboard.transcriptAndProfile}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                  </Link>

                  <Link 
                    to="/dashboard/logbook" 
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 hover:border-emerald-300 transition-all font-semibold text-sm text-slate-700 border border-slate-200/70 group"
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      {t.dashboard.weeklyCwieLogbook}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                  </Link>
                </>
              )}

              {user.role === 'COMPANY_HR' && (
                <>
                  <Link 
                    to="/dashboard/jobs/manage" 
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 hover:border-emerald-300 transition-all font-semibold text-sm text-slate-700 border border-slate-200/70 group"
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      {t.dashboard.postNewJob}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                  </Link>

                  <Link 
                    to="/dashboard/applicants" 
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 hover:border-emerald-300 transition-all font-semibold text-sm text-slate-700 border border-slate-200/70 group"
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      {t.dashboard.reviewApplicants}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl shadow-xs border border-slate-200/80">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">{t.dashboard.recentActivity}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time status updates across your talent pipeline</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
              {t.dashboard.liveFeed}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">{t.common.loading}</div>
          ) : recent.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recent.map((item: any, i: number) => (
                <div key={i} className="py-4 flex items-center justify-between group hover:bg-slate-50/80 rounded-2xl px-3 transition-colors">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-100">
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
                      {formatDate(item.createdAt, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 text-sm">
              <FileCheck2 className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600">{t.dashboard.noActivity}</p>
              <p className="text-xs text-slate-400 mt-1">{t.dashboard.noActivityDesc}</p>
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
      case 0: return <Briefcase className="w-6 h-6 text-emerald-600" />;
      case 1: return <Clock className="w-6 h-6 text-teal-600" />;
      case 2: return <CheckCircle2 className="w-6 h-6 text-emerald-700" />;
      default: return <Building2 className="w-6 h-6 text-emerald-600" />;
    }
  };

  const getBg = (i: number) => {
    switch (i) {
      case 0: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 1: return 'bg-teal-50 text-teal-700 border-teal-100';
      case 2: return 'bg-green-50 text-green-700 border-green-100';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  };

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-xs border border-slate-200/80 flex items-center justify-between hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all group">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{title}</p>
        <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">{value}</p>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-2xs group-hover:scale-110 transition-transform ${getBg(index)}`}>
        {getIcon(index)}
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200 animate-pulse flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-slate-200 rounded"></div>
        <div className="h-8 w-12 bg-slate-200 rounded"></div>
      </div>
      <div className="w-14 h-14 bg-slate-100 rounded-2xl"></div>
    </div>
  );
}
