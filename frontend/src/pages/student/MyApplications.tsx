import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  Calendar, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

interface Application {
  id: string;
  status: string;
  coverLetter: string | null;
  createdAt: string;
  documents?: { id: string; title: string; fileUrl: string; type?: string }[];
  jobPost: {
    title: string;
    location?: string;
    company: {
      companyName: string;
      logoUrl: string | null;
    };
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: any; step: number }> = {
  PENDING: { 
    label: 'Pending Review', 
    color: 'bg-amber-50 text-amber-700 border-amber-200', 
    icon: Clock,
    step: 1 
  },
  REVIEWING: { 
    label: 'Under HR Review', 
    color: 'bg-blue-50 text-blue-700 border-blue-200', 
    icon: FileText,
    step: 2 
  },
  ACCEPTED: { 
    label: 'Offer Accepted by HR', 
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
    icon: CheckCircle2,
    step: 3 
  },
  REJECTED: { 
    label: 'Declined', 
    color: 'bg-rose-50 text-rose-700 border-rose-200', 
    icon: XCircle,
    step: 0 
  },
  APPROVED_BY_UNIVERSITY: { 
    label: 'University Approved', 
    color: 'bg-purple-50 text-purple-700 border-purple-200', 
    icon: ShieldCheck,
    step: 4 
  },
};

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'accepted' | 'rejected'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/applications/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = applications.filter(app => {
    if (activeTab === 'active') return app.status === 'PENDING' || app.status === 'REVIEWING';
    if (activeTab === 'accepted') return app.status === 'ACCEPTED' || app.status === 'APPROVED_BY_UNIVERSITY';
    if (activeTab === 'rejected') return app.status === 'REJECTED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-100">
              Pipeline
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {applications.length} Total Applications
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Applications
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time status tracking for every internship you've submitted.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'active' ? 'bg-white text-primary-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'accepted' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Offers
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'rejected' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Declined
          </button>
        </div>
      </div>

      {/* ── Applications List ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-4">
              <div className="h-6 w-1/3 bg-slate-200 rounded"></div>
              <div className="h-4 w-1/4 bg-slate-100 rounded"></div>
              <div className="h-10 w-full bg-slate-50 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredApps.length > 0 ? (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const status = statusConfig[app.status] || statusConfig.PENDING;
            const StatusIcon = status.icon;
            const isExpanded = expandedId === app.id;

            return (
              <div 
                key={app.id} 
                className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-7 hover:shadow-md transition-all space-y-6"
              >
                {/* Top Info Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-primary-500/20 flex-shrink-0">
                      {app.jobPost.company.companyName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">
                        {app.jobPost.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mt-1">
                        <span className="flex items-center gap-1 text-primary-600">
                          <Building2 className="w-3.5 h-3.5" />
                          {app.jobPost.company.companyName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          Applied {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border ${status.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* 4-Stage Progress Stepper */}
                {app.status !== 'REJECTED' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="grid grid-cols-4 gap-2 text-center relative">
                      {[
                        { stepNum: 1, label: 'Submitted' },
                        { stepNum: 2, label: 'HR Review' },
                        { stepNum: 3, label: 'HR Offer' },
                        { stepNum: 4, label: 'Uni Approved' },
                      ].map((s) => {
                        const isDone = status.step >= s.stepNum;
                        const isCurrent = status.step === s.stepNum;

                        return (
                          <div key={s.stepNum} className="flex flex-col items-center gap-1.5 relative z-10">
                            <div 
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isDone 
                                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/30' 
                                  : 'bg-slate-200 text-slate-500'
                              } ${isCurrent ? 'ring-4 ring-primary-100 scale-110' : ''}`}
                            >
                              {isDone ? '✓' : s.stepNum}
                            </div>
                            <span className={`text-[11px] font-bold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cover Letter Dropdown */}
                {app.coverLetter && (
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : app.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {isExpanded ? 'Hide Cover Letter' : 'View Submitted Cover Letter'}
                    </button>
                    {isExpanded && (
                      <p className="mt-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                        "{app.coverLetter}"
                      </p>
                    )}
                  </div>
                )}

                {/* Attached Documents & Artifacts */}
                {app.documents && app.documents.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400">Attached Artifacts:</span>
                    {app.documents.map((doc, dIdx) => {
                      const isLink = doc.fileUrl.startsWith('http://') || doc.fileUrl.startsWith('https://');
                      const url = isLink ? doc.fileUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${doc.fileUrl}`;
                      return (
                        <a
                          key={doc.id || dIdx}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          {isLink ? <ExternalLink className="w-3 h-3 text-indigo-600" /> : <FileText className="w-3 h-3 text-primary-600" />}
                          <span>{doc.title || 'Document'}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No applications in this view</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Start browsing available internship opportunities to submit your first application.
            </p>
          </div>
          <Link
            to="/dashboard/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-bold text-xs rounded-xl hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all"
          >
            Explore Internships
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

