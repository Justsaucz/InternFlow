import { useEffect, useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  X,
  Calendar,
  Laptop,
  Building,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

interface StudentInfo {
  id: string;
  studentId: string;
  faculty: string;
  major: string;
  year: number;
  user: { name: string; email: string };
  university: { name: string };
  weeklyLogs: any[];
}

interface ActiveIntern {
  applicationId: string;
  status: string;
  jobTitle: string;
  student: StudentInfo;
  totalHours: number;
  approvedHours: number;
  targetHours: number;
  evaluation: any;
}

export default function CompanyEvaluations() {
  const [interns, setInterns] = useState<ActiveIntern[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntern, setSelectedIntern] = useState<ActiveIntern | null>(null);
  const [selectedForLogs, setSelectedForLogs] = useState<ActiveIntern | null>(null);
  const [studentLogs, setStudentLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const { success, error: showError } = useToast();

  // Final Evaluation Rubric State
  const [workQuality, setWorkQuality] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [teamwork, setTeamwork] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Weekly Log Sign-off State
  const [approvingLogId, setApprovingLogId] = useState<string | null>(null);
  const [logWeeklyRating, setLogWeeklyRating] = useState<number>(5);
  const [logMentorFeedback, setLogMentorFeedback] = useState<string>('');
  const [approvingSubmitting, setApprovingSubmitting] = useState(false);

  useEffect(() => {
    fetchInterns();
  }, []);

  const fetchInterns = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/evaluations/company`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInterns(data);
      }
    } catch (error) {
      console.error(error);
      showError('Failed to load interns roster');
    } finally {
      setLoading(false);
    }
  };

  const openEvaluationModal = (intern: ActiveIntern) => {
    setSelectedIntern(intern);
    if (intern.evaluation) {
      setWorkQuality(intern.evaluation.workQualityScore || 5);
      setPunctuality(intern.evaluation.punctualityScore || 5);
      setTeamwork(intern.evaluation.teamworkScore || 5);
      setFeedback(intern.evaluation.feedback || '');
    } else {
      setWorkQuality(5);
      setPunctuality(5);
      setTeamwork(5);
      setFeedback('');
    }
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntern) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/evaluations/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: selectedIntern.student.id,
          applicationId: selectedIntern.applicationId,
          workQualityScore: workQuality,
          punctualityScore: punctuality,
          teamworkScore: teamwork,
          feedback
        })
      });

      if (res.ok) {
        success('Evaluation submitted successfully!');
        setSelectedIntern(null);
        fetchInterns();
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to submit evaluation');
      }
    } catch (error) {
      showError('Network error submitting evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  const openLogsDrawer = async (intern: ActiveIntern) => {
    setSelectedForLogs(intern);
    setLogsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/logbook/student/${intern.student.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudentLogs(data.logs || []);
      }
    } catch (error) {
      console.error(error);
      showError('Failed to fetch student logs');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleApproveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingLogId) return;
    setApprovingSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/logbook/${approvingLogId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          mentorFeedback: logMentorFeedback || 'Work verified and approved by company mentor.',
          mentorRating: logWeeklyRating
        })
      });

      if (res.ok) {
        success('Weekly log signed off with rating!');
        setApprovingLogId(null);
        setLogMentorFeedback('');
        setLogWeeklyRating(5);
        if (selectedForLogs) {
          openLogsDrawer(selectedForLogs);
        }
        fetchInterns();
      }
    } catch (error) {
      showError('Error approving weekly log');
    } finally {
      setApprovingSubmitting(false);
    }
  };

  const getModalityBadge = (modality: string) => {
    switch (modality) {
      case 'REMOTE':
        return { label: 'Remote / WFH', icon: Laptop, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'HYBRID':
        return { label: 'Hybrid', icon: RefreshCw, color: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'On-site', icon: Building, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-100">
            Company Portal
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {interns.length} Active Interns
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Active Interns & Evaluations
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Inspect student logbooks, rate weekly performance (1-5★), sign off on attendance, and submit competency assessments.
        </p>
      </div>

      {/* ── Interns Grid Cards ─────────────────────────────────────────────── */}
      {interns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interns.map((item) => {
            const hasEvaluated = Boolean(item.evaluation);
            const percent = Math.min(100, Math.round((item.totalHours / item.targetHours) * 100));

            return (
              <div 
                key={item.applicationId}
                className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-sm">
                      {item.student.user.name.charAt(0)}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      hasEvaluated 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {hasEvaluated ? 'Evaluated ✓' : 'Pending Evaluation'}
                    </span>
                  </div>

                  {/* Student Details */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {item.student.user.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.student.faculty} • {item.student.major}
                    </p>
                    <p className="text-xs font-semibold text-primary-600 mt-1">
                      Role: {item.jobTitle}
                    </p>
                  </div>

                  {/* Hours Progress Bar */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Logged Hours</span>
                      <span className="text-primary-600">{item.totalHours} / {item.targetHours}h ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-primary-600 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => openLogsDrawer(item)}
                    className="flex-1 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    Review Logs
                  </button>
                  <button
                    onClick={() => openEvaluationModal(item)}
                    className="flex-1 px-3 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    {hasEvaluated ? 'Edit Rubric' : 'Evaluate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-900">No Active Interns</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When you accept student applicants and university approvals are completed, they will appear here.
          </p>
        </div>
      )}

      {/* ── Rubric Final Evaluation Modal ──────────────────────────────────── */}
      {selectedIntern && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-7 py-5 bg-gradient-to-r from-slate-900 to-slate-950 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400">
                  Performance Evaluation Rubric
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  {selectedIntern.student.user.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedIntern(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="p-7 space-y-6">
              {/* Criterion 1 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    1. Work Quality & Competence
                  </label>
                  <span className="text-sm font-black text-primary-600">{workQuality} / 5</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setWorkQuality(val)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        workQuality === val 
                          ? 'bg-primary-600 text-white border-primary-600 shadow-sm' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {val} ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Criterion 2 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    2. Punctuality & Responsibility
                  </label>
                  <span className="text-sm font-black text-primary-600">{punctuality} / 5</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setPunctuality(val)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        punctuality === val 
                          ? 'bg-primary-600 text-white border-primary-600 shadow-sm' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {val} ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Criterion 3 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    3. Communication & Teamwork
                  </label>
                  <span className="text-sm font-black text-primary-600">{teamwork} / 5</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTeamwork(val)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        teamwork === val 
                          ? 'bg-primary-600 text-white border-primary-600 shadow-sm' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {val} ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Textarea */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Supervisor Feedback & Highlights
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Summarize the intern's achievements, strengths, and areas of recommendation..."
                  className="w-full border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary-500"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedIntern(null)}
                  className="flex-1 px-5 py-3 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:from-primary-700 hover:to-indigo-700 shadow-md shadow-primary-500/20"
                >
                  {submitting ? 'Submitting...' : 'Save Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Student Weekly Logs Drawer / Modal ─────────────────────────────── */}
      {selectedForLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-7 py-5 bg-gradient-to-r from-slate-900 to-slate-950 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400">
                  Weekly Logbook Review & Sign-off
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  {selectedForLogs.student.user.name} ({selectedForLogs.student.studentId})
                </h3>
              </div>
              <button 
                onClick={() => { setSelectedForLogs(null); setApprovingLogId(null); }}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-7 space-y-6 max-h-[75vh] overflow-y-auto">
              {logsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : studentLogs.length > 0 ? (
                <div className="space-y-5">
                  {studentLogs.map((log) => {
                    const modalityInfo = getModalityBadge(log.workModality);
                    const ModalityIcon = modalityInfo.icon;

                    return (
                      <div key={log.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                        {/* Log Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-900">
                                Week {log.weekNumber} Report
                              </span>
                              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${modalityInfo.color}`}>
                                <ModalityIcon className="w-3 h-3" />
                                {modalityInfo.label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(log.startDate).toLocaleDateString()} - {new Date(log.endDate).toLocaleDateString()}
                              {log.supervisorName && (
                                <span className="text-slate-400"> • Mentor: <strong className="text-slate-700">{log.supervisorName}</strong></span>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-slate-200 text-primary-600 shadow-2xs">
                              {log.hoursWorked} Hours
                            </span>
                            {log.mentorApproved ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Approved {log.mentorRating ? `(${log.mentorRating} ★)` : ''}
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setApprovingLogId(log.id);
                                  setLogMentorFeedback(log.mentorFeedback || '');
                                  setLogWeeklyRating(log.mentorRating || 5);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                              >
                                Sign Off Week
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Planned vs Actual */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200/70">
                            <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                              🎯 Planned Objectives:
                            </p>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                              {log.plannedTasks || 'No planned objectives recorded.'}
                            </p>
                          </div>
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200/70">
                            <p className="font-bold text-[10px] text-primary-600 uppercase tracking-wider mb-1">
                              ✅ Tasks & Deliverables Completed:
                            </p>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                              {log.tasksDone}
                            </p>
                          </div>
                        </div>

                        {/* Problems & Solutions */}
                        {log.problemsAndSolutions && (
                          <div className="bg-amber-50/60 border border-amber-100 p-3 rounded-xl text-xs">
                            <p className="font-bold text-amber-900 mb-0.5">⚠️ Problems Encountered & Solutions:</p>
                            <p className="text-amber-800">{log.problemsAndSolutions}</p>
                          </div>
                        )}

                        {/* Mentor Feedback & Faculty Review status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                          <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                            <p className="font-bold text-slate-600 text-[10px] uppercase">Company Feedback:</p>
                            <p className="italic text-slate-700 text-[11px] mt-0.5">
                              {log.mentorFeedback ? `"${log.mentorFeedback}"` : 'No feedback yet.'}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                            <p className="font-bold text-purple-700 text-[10px] uppercase flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />
                              Faculty Advisor Review:
                            </p>
                            <p className="italic text-slate-700 text-[11px] mt-0.5">
                              {log.facultyVerified ? `"${log.facultyRemarks || 'Verified'}"` : 'Pending faculty review.'}
                            </p>
                          </div>
                        </div>

                        {/* Inline Sign-off Form */}
                        {approvingLogId === log.id && (
                          <form onSubmit={handleApproveLog} className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-3 mt-2 animate-in fade-in">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-black text-emerald-900">
                                Sign Off & Rate Week {log.weekNumber}
                              </span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setLogWeeklyRating(star)}
                                    className={`p-1 rounded-md text-xs font-bold transition-colors ${
                                      logWeeklyRating >= star ? 'text-amber-500' : 'text-slate-300'
                                    }`}
                                  >
                                    ★
                                  </button>
                                ))}
                                <span className="text-xs font-bold text-emerald-800 ml-1">({logWeeklyRating} / 5)</span>
                              </div>
                            </div>

                            <textarea
                              rows={2}
                              required
                              placeholder="Write weekly mentor feedback, verify hours and performance..."
                              className="w-full border border-emerald-300 bg-white rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                              value={logMentorFeedback}
                              onChange={(e) => setLogMentorFeedback(e.target.value)}
                            ></textarea>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setApprovingLogId(null)}
                                className="px-3 py-1.5 border border-emerald-300 bg-white text-emerald-800 text-xs font-bold rounded-lg"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={approvingSubmitting}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs"
                              >
                                {approvingSubmitting ? 'Signing off...' : 'Confirm Sign-off'}
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No weekly logs submitted by this student yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
