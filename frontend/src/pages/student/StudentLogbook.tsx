import { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Building2, 
  ExternalLink, 
  X, 
  Printer,
  Pencil,
  Trash2,
  UserCheck,
  Laptop,
  Building,
  RefreshCw
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

interface WeeklyLog {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  workModality: 'ON_SITE' | 'REMOTE' | 'HYBRID';
  supervisorName: string | null;
  plannedTasks: string | null;
  tasksDone: string;
  problemsAndSolutions: string | null;
  learnings: string;
  hoursWorked: number;
  attachmentUrl: string | null;
  mentorApproved: boolean;
  mentorRating: number | null;
  mentorFeedback: string | null;
  facultyVerified: boolean;
  facultyRemarks: string | null;
  facultyVerifiedAt: string | null;
  createdAt: string;
}

interface LogbookData {
  student: any;
  logs: WeeklyLog[];
  totalHours: number;
  approvedHours: number;
  facultyVerifiedCount: number;
  targetHours: number;
  activePlacement: any;
}

export default function StudentLogbook() {
  const [data, setData] = useState<LogbookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [weekNumber, setWeekNumber] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [workModality, setWorkModality] = useState<'ON_SITE' | 'REMOTE' | 'HYBRID'>('ON_SITE');
  const [supervisorName, setSupervisorName] = useState('');
  const [plannedTasks, setPlannedTasks] = useState('');
  const [tasksDone, setTasksDone] = useState('');
  const [problemsAndSolutions, setProblemsAndSolutions] = useState('');
  const [learnings, setLearnings] = useState('');
  const [hoursWorked, setHoursWorked] = useState(40);
  const [attachmentUrl, setAttachmentUrl] = useState('');

  useEffect(() => {
    fetchLogbook();
  }, []);

  const fetchLogbook = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/logbook/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
        if (result.logs && result.logs.length > 0) {
          setWeekNumber(result.logs.length + 1);
        }
      }
    } catch (error) {
      console.error(error);
      showError('Failed to load logbook data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    const nextWeek = data?.logs && data.logs.length > 0 ? data.logs.length + 1 : 1;
    setWeekNumber(nextWeek);
    setStartDate('');
    setEndDate('');
    setWorkModality('ON_SITE');
    setSupervisorName('');
    setPlannedTasks('');
    setTasksDone('');
    setProblemsAndSolutions('');
    setLearnings('');
    setHoursWorked(40);
    setAttachmentUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (log: WeeklyLog) => {
    setEditingId(log.id);
    setWeekNumber(log.weekNumber);
    setStartDate(log.startDate ? new Date(log.startDate).toISOString().split('T')[0] : '');
    setEndDate(log.endDate ? new Date(log.endDate).toISOString().split('T')[0] : '');
    setWorkModality(log.workModality || 'ON_SITE');
    setSupervisorName(log.supervisorName || '');
    setPlannedTasks(log.plannedTasks || '');
    setTasksDone(log.tasksDone || '');
    setProblemsAndSolutions(log.problemsAndSolutions || '');
    setLearnings(log.learnings || '');
    setHoursWorked(log.hoursWorked || 40);
    setAttachmentUrl(log.attachmentUrl || '');
    setIsModalOpen(true);
  };

  const handleDeleteLog = async (logId: string) => {
    if (!window.confirm('Are you sure you want to delete this weekly log entry?')) return;
    setDeletingId(logId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/logbook/${logId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        success('Weekly log deleted successfully!');
        fetchLogbook();
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to delete weekly log');
      }
    } catch (error) {
      showError('Network error deleting weekly log');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateOrUpdateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/logbook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: editingId || undefined,
          weekNumber,
          startDate,
          endDate,
          workModality,
          supervisorName,
          plannedTasks,
          tasksDone,
          problemsAndSolutions,
          learnings,
          hoursWorked,
          attachmentUrl
        })
      });

      if (res.ok) {
        success(editingId ? 'Weekly log updated successfully!' : 'Weekly log saved successfully!');
        setIsModalOpen(false);
        setEditingId(null);
        fetchLogbook();
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to save log');
      }
    } catch (error) {
      showError('Network error while saving log');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const logs = data?.logs || [];
  const totalHours = data?.totalHours || 0;
  const targetHours = data?.targetHours || 400;
  const percentComplete = Math.min(100, Math.round((totalHours / targetHours) * 100));
  const activePlacement = data?.activePlacement;
  const evaluation = activePlacement?.evaluation;

  const getModalityBadge = (modality: string) => {
    switch (modality) {
      case 'REMOTE':
        return { label: 'Remote / WFH', icon: Laptop, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'HYBRID':
        return { label: 'Hybrid Attendance', icon: RefreshCw, color: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'On-site Office', icon: Building, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-100">
              Operational Logbook
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Dual Inspection & Verification
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Internship Weekly Journal
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Log real-world tasks, track planned vs actual outcomes, and receive dual verification from both Mentor & University.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {evaluation && (
            <button
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-bold text-xs shadow-2xs transition-all"
            >
              <Printer className="w-4 h-4" />
              View Official Report
            </button>
          )}

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-primary-500/20 hover:from-primary-700 hover:to-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Weekly Log
          </button>
        </div>
      </div>

      {/* ── Progress & Placement Overview Cards ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hours & Dual Verification Progress */}
        <div className="md:col-span-2 bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Logged Hours</p>
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                {totalHours} <span className="text-base text-slate-400 font-bold">/ {targetHours} Hours</span>
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-xs">
              {percentComplete}% Completed
            </span>
          </div>

          <div>
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5">
              <div 
                className="bg-gradient-to-r from-primary-600 via-sky-500 to-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${percentComplete}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-bold text-slate-600 mt-3 pt-3 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Entries</span>
                <span>{logs.length} Weeks</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Mentor Sign-offs</span>
                <span className="text-emerald-700">{data?.approvedHours || 0} hrs approved</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Faculty Verified</span>
                <span className="text-purple-700">{logs.filter(l => l.facultyVerified).length} / {logs.length} Weeks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Company & Role Card */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Placement Organization</p>
            {activePlacement ? (
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  {activePlacement.jobPost?.title}
                </h4>
                <p className="text-xs font-bold text-primary-600 flex items-center gap-1 mt-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {activePlacement.jobPost?.company?.companyName}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Final Academic Grade:</span>
                  <span className={`font-black px-2.5 py-0.5 rounded-full ${
                    evaluation?.finalGrade 
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {evaluation?.finalGrade ? `Grade: ${evaluation.finalGrade}` : 'In Progress'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4">
                No active approved placement linked yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Weekly Logs Timeline ───────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Weekly Log Entries</h3>
            <p className="text-xs text-slate-500 mt-0.5">Chronological record of attendance, tasks, problem solving, and dual reviews</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
            {logs.length} Total Entries
          </span>
        </div>

        {logs.length > 0 ? (
          <div className="space-y-5">
            {logs.map((log) => {
              const modalityInfo = getModalityBadge(log.workModality);
              const ModalityIcon = modalityInfo.icon;

              return (
                <div 
                  key={log.id} 
                  className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-4 hover:bg-slate-50 transition-colors"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                        W{log.weekNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900">
                            Week {log.weekNumber} Report
                          </h4>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${modalityInfo.color}`}>
                            <ModalityIcon className="w-3 h-3" />
                            {modalityInfo.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(log.startDate).toLocaleDateString()} – {new Date(log.endDate).toLocaleDateString()}
                          {log.supervisorName && (
                            <span className="text-slate-400 font-medium">
                              • Mentor: <strong className="text-slate-700">{log.supervisorName}</strong>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-primary-600" />
                        {log.hoursWorked} Hours
                      </span>

                      {/* Edit & Delete */}
                      <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                        <button
                          onClick={() => handleOpenEdit(log)}
                          title="Edit Weekly Log"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          disabled={deletingId === log.id}
                          title="Delete Weekly Log"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white border border-transparent hover:border-red-200 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Planned vs Actual Tasks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                      <p className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                        🎯 Planned Objectives (Start of Week)
                      </p>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {log.plannedTasks || 'No planned objectives recorded.'}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                      <p className="font-bold text-[10px] uppercase tracking-wider text-primary-600 mb-1 flex items-center gap-1">
                        ✅ Actual Tasks & Deliverables Completed
                      </p>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {log.tasksDone}
                      </p>
                    </div>
                  </div>

                  {/* Problems/Solutions & Learnings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                      <p className="font-bold text-[10px] uppercase tracking-wider text-amber-600 mb-1 flex items-center gap-1">
                        ⚠️ Problems Encountered & Solutions
                      </p>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {log.problemsAndSolutions || 'No major issues encountered this week.'}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                      <p className="font-bold text-[10px] uppercase tracking-wider text-indigo-600 mb-1 flex items-center gap-1">
                        💡 Key Learnings & Technical Growth
                      </p>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {log.learnings}
                      </p>
                    </div>
                  </div>

                  {/* Dual Verification Feedback Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* Company Sign-off */}
                    <div className={`p-3.5 rounded-xl border text-xs ${
                      log.mentorApproved 
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                        : 'bg-amber-50/70 border-amber-200 text-amber-900'
                    }`}>
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          Company Mentor Review:
                        </span>
                        {log.mentorApproved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved {log.mentorRating ? `(${log.mentorRating} ★)` : ''}
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-amber-700">Awaiting Sign-off ⏳</span>
                        )}
                      </div>
                      <p className="text-[11px] italic mt-0.5">
                        {log.mentorFeedback ? `"${log.mentorFeedback}"` : 'No mentor feedback submitted yet.'}
                      </p>
                    </div>

                    {/* Faculty Verification */}
                    <div className={`p-3.5 rounded-xl border text-xs ${
                      log.facultyVerified 
                        ? 'bg-purple-50/70 border-purple-200 text-purple-900' 
                        : 'bg-slate-100/70 border-slate-200 text-slate-700'
                    }`}>
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5" />
                          Faculty Advisor Review:
                        </span>
                        {log.facultyVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified ✓
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-500">Pending Faculty Review ⏳</span>
                        )}
                      </div>
                      <p className="text-[11px] italic mt-0.5">
                        {log.facultyRemarks ? `"${log.facultyRemarks}"` : 'No faculty advice recorded yet.'}
                      </p>
                    </div>
                  </div>

                  {log.attachmentUrl && (
                    <div className="pt-1">
                      <a 
                        href={log.attachmentUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Attached Work / Timesheet / Deliverable
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 border border-slate-200 border-dashed rounded-2xl space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-900">No Weekly Logs Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click the "Add Weekly Log" button to start recording your weekly internship activities.
            </p>
          </div>
        )}
      </div>

      {/* ── Add / Edit Weekly Log Modal ────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-7 py-5 bg-gradient-to-r from-slate-900 to-slate-950 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400">
                  Operational Logbook Entry
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  {editingId ? `Edit Weekly Log (Week ${weekNumber})` : 'Record Weekly Journal'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateLog} className="p-7 space-y-5">
              {/* Row 1: Week # & Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Week Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    required
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500"
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Hours Worked
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={80}
                    required
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500"
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Row 2: Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3: Work Modality & Supervisor Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Work Modality / Attendance
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'ON_SITE', label: 'On-site' },
                      { id: 'REMOTE', label: 'Remote' },
                      { id: 'HYBRID', label: 'Hybrid' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setWorkModality(item.id as any)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          workModality === item.id
                            ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Supervisor / Mentor Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., John Smith (Lead Engineer)"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 4: Planned Objectives */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Planned Objectives (Start of Week)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., 1. Setup CI/CD pipeline in GitHub Actions, 2. Resolve authentication race condition..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500"
                  value={plannedTasks}
                  onChange={(e) => setPlannedTasks(e.target.value)}
                ></textarea>
              </div>

              {/* Row 5: Actual Tasks Completed */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Actual Tasks & Deliverables Completed
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g., Successfully integrated Docker container builds, tested with Jest with 100% test pass rate..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500"
                  value={tasksDone}
                  onChange={(e) => setTasksDone(e.target.value)}
                ></textarea>
              </div>

              {/* Row 6: Problems & Solutions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Problems Encountered & Solutions (Troubleshooting)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Encountered database connection pool exhaustion; resolved by configuring Prisma connection limits..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500"
                  value={problemsAndSolutions}
                  onChange={(e) => setProblemsAndSolutions(e.target.value)}
                ></textarea>
              </div>

              {/* Row 7: Learnings */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Key Learnings & Skill Growth
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g., Gained deep understanding of PostgreSQL transactions and async Express error handling..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500"
                  value={learnings}
                  onChange={(e) => setLearnings(e.target.value)}
                ></textarea>
              </div>

              {/* Row 8: Attachment Link */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Attachment / Artifact Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/... or https://figma.com/..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-5 py-3 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:from-primary-700 hover:to-indigo-700 shadow-md shadow-primary-500/20"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Weekly Log' : 'Save Weekly Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Official Report Modal ─────────────────────────────────────────── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 my-8 print:shadow-none print:border-none print:m-0">
            {/* Action Bar (Hidden in Print) */}
            <div className="px-7 py-4 bg-slate-900 text-white flex justify-between items-center print:hidden">
              <span className="text-xs font-bold">Official Internship Completion Report</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-slate-400 hover:text-white text-sm font-bold ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-10 space-y-8 bg-white text-slate-900 font-sans">
              <div className="border-b-2 border-slate-900 pb-6 text-center space-y-1">
                <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">
                  {data?.student?.university?.name || 'University'}
                </h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Faculty of {data?.student?.faculty || 'Engineering'} • Department of {data?.student?.major || 'Computer Engineering'}
                </p>
                <h2 className="text-lg font-extrabold text-primary-700 pt-2">
                  Official Internship Completion Certificate & Assessment Report
                </h2>
              </div>

              {/* Student & Company Data */}
              <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="space-y-1.5">
                  <p><span className="font-bold text-slate-500">Student Name:</span> <span className="font-extrabold">{data?.student?.user?.name}</span></p>
                  <p><span className="font-bold text-slate-500">Student ID:</span> {data?.student?.studentId}</p>
                  <p><span className="font-bold text-slate-500">Academic Year:</span> Year {data?.student?.year}</p>
                </div>
                <div className="space-y-1.5">
                  <p><span className="font-bold text-slate-500">Host Organization:</span> <span className="font-extrabold">{activePlacement?.jobPost?.company?.companyName}</span></p>
                  <p><span className="font-bold text-slate-500">Position Title:</span> {activePlacement?.jobPost?.title}</p>
                  <p><span className="font-bold text-slate-500">Total Hours Completed:</span> <span className="font-extrabold text-emerald-700">{totalHours} / 400 Hours</span></p>
                </div>
              </div>

              {/* Dual Inspection Verification Summary */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <p className="font-bold text-emerald-900 uppercase text-[10px]">Company Sign-offs</p>
                  <p className="text-base font-black text-emerald-800 mt-0.5">
                    {data?.approvedHours || 0} Hours Approved ({logs.filter(l => l.mentorApproved).length} Weeks)
                  </p>
                </div>
                <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-200">
                  <p className="font-bold text-purple-900 uppercase text-[10px]">Faculty Verifications</p>
                  <p className="text-base font-black text-purple-800 mt-0.5">
                    {logs.filter(l => l.facultyVerified).length} / {logs.length} Weeks Verified
                  </p>
                </div>
              </div>

              {/* Evaluation Rubric Results */}
              {evaluation && (
                <div className="space-y-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                    Host Organization Assessment Rubric
                  </h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Work Quality</p>
                      <p className="text-xl font-black text-primary-600 mt-1">{evaluation.workQualityScore} / 5</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Punctuality</p>
                      <p className="text-xl font-black text-primary-600 mt-1">{evaluation.punctualityScore} / 5</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Teamwork</p>
                      <p className="text-xl font-black text-primary-600 mt-1">{evaluation.teamworkScore} / 5</p>
                    </div>
                  </div>
                  {evaluation.feedback && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <p className="font-bold text-slate-600 mb-1">Company Supervisor Remarks:</p>
                      <p className="italic text-slate-700">"{evaluation.feedback}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Academic Final Grade */}
              <div className="p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-purple-900 uppercase tracking-wider">Final Academic Grade</p>
                  <p className="text-xs text-purple-700 mt-0.5">Assigned by University Internship Committee</p>
                </div>
                <div className="text-3xl font-black text-purple-900 bg-white px-5 py-2 rounded-xl shadow-xs border border-purple-200">
                  {evaluation?.finalGrade || 'PENDING'}
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-12 pt-8 text-center text-xs">
                <div className="border-t border-slate-300 pt-3">
                  <p className="font-bold text-slate-800">Company Mentor / Supervisor Signature</p>
                  <p className="text-[10px] text-slate-400 mt-1">Authorized Representative</p>
                </div>
                <div className="border-t border-slate-300 pt-3">
                  <p className="font-bold text-slate-800">University Faculty Advisor Signature</p>
                  <p className="text-[10px] text-slate-400 mt-1">Internship Program Chair</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
