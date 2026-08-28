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
  Trash2
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

interface WeeklyLog {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  tasksDone: string;
  learnings: string;
  hoursWorked: number;
  attachmentUrl: string | null;
  mentorApproved: boolean;
  mentorFeedback: string | null;
  createdAt: string;
}

interface LogbookData {
  student: any;
  logs: WeeklyLog[];
  totalHours: number;
  approvedHours: number;
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
  const [tasksDone, setTasksDone] = useState('');
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
    setTasksDone('');
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
    setTasksDone(log.tasksDone || '');
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
          tasksDone,
          learnings,
          hoursWorked,
          attachmentUrl
        })
      });

      if (res.ok) {
        success(editingId ? 'Weekly log updated successfully!' : 'Weekly log saved successfully!');
        setIsModalOpen(false);
        setEditingId(null);
        setTasksDone('');
        setLearnings('');
        setAttachmentUrl('');
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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-100">
              Internship Logbook
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Weekly Progress & Hours
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Weekly Journal & Evaluation
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Record tasks, track required hours, and submit weekly entries for mentor sign-off.
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

      {/* ── Progress & Placement Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hours Progress Card */}
        <div className="md:col-span-2 bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Internship Hours Progress</p>
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
                className="bg-gradient-to-r from-primary-600 to-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${percentComplete}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-500 mt-2">
              <span>{logs.length} Weeks Recorded</span>
              <span>{data?.approvedHours || 0} Hours Mentor Approved</span>
            </div>
          </div>
        </div>

        {/* Company Info Card */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Active Placement</p>
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
                  <span className="text-slate-500 font-medium">Evaluation Status:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full ${
                    evaluation?.finalGrade 
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : evaluation
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {evaluation?.finalGrade ? `Grade: ${evaluation.finalGrade}` : evaluation ? 'Company Evaluated' : 'In Progress'}
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
            <p className="text-xs text-slate-500 mt-0.5">Chronological record of your work and learnings</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
            {logs.length} Total Entries
          </span>
        </div>

        {logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                      W{log.weekNumber}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        Week {log.weekNumber} Log
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(log.startDate).toLocaleDateString()} – {new Date(log.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
                      <Clock className="w-3.5 h-3.5 text-primary-600" />
                      {log.hoursWorked} Hours
                    </span>

                    {log.mentorApproved ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved by Mentor
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
                        <Clock className="w-3.5 h-3.5" />
                        Awaiting Sign-off
                      </span>
                    )}

                    {/* Edit & Delete Action Buttons */}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1 text-primary-600">
                      Tasks Completed
                    </p>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{log.tasksDone}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1 text-indigo-600">
                      Key Learnings & Challenges
                    </p>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{log.learnings}</p>
                  </div>
                </div>

                {log.mentorFeedback && (
                  <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-xl text-xs">
                    <span className="font-bold text-emerald-800">Mentor Feedback: </span>
                    <span className="text-emerald-700">{log.mentorFeedback}</span>
                  </div>
                )}

                {log.attachmentUrl && (
                  <div className="pt-1">
                    <a 
                      href={log.attachmentUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Attached Work / Deliverable
                    </a>
                  </div>
                )}
              </div>
            ))}
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-7 py-5 bg-gradient-to-r from-slate-900 to-slate-950 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400">
                  Internship Logbook
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  {editingId ? `Edit Weekly Log (Week ${weekNumber})` : 'Record Weekly Entry'}
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tasks Completed This Week
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g., Developed authentication API endpoints, integrated PostgreSQL migrations, tested UI with Jest..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500"
                  value={tasksDone}
                  onChange={(e) => setTasksDone(e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Learnings & Technical Growth
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g., Learned how to write Prisma transactions and handle async connection pooling..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500"
                  value={learnings}
                  onChange={(e) => setLearnings(e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Attachment / Deliverable Link (Optional)
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
