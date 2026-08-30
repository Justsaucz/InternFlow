import { useEffect, useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  X,
  Calendar,
  Laptop,
  Building,
  RefreshCw,
  UserCheck,
  ExternalLink,
  Link as LinkIcon,
  FileText
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { parsePinPoints, parseAttachmentLinks } from '../student/StudentLogbook';
import PublicProfileModal from '../../components/modals/PublicProfileModal';

interface StudentInfo {
  id: string;
  studentId: string;
  faculty: string;
  major: string;
  year: number;
  avatarUrl?: string | null;
  user: { id?: string; name: string; email: string; avatarUrl?: string | null };
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
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);
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
      showError('Failed to load active interns');
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

  const openLogsModal = async (intern: ActiveIntern) => {
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
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/logbook/approve/${approvingLogId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          mentorRating: logWeeklyRating,
          mentorFeedback: logMentorFeedback
        })
      });

      if (res.ok) {
        success('Weekly log sign-off submitted successfully!');
        setApprovingLogId(null);
        if (selectedForLogs) {
          openLogsModal(selectedForLogs);
        }
        fetchInterns();
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to sign off weekly log');
      }
    } catch (error) {
      showError('Network error while signing off log');
    } finally {
      setApprovingSubmitting(false);
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
          applicationId: selectedIntern.applicationId,
          workQualityScore: workQuality,
          punctualityScore: punctuality,
          teamworkScore: teamwork,
          feedback
        })
      });

      if (res.ok) {
        success('Employer rubric evaluation submitted successfully!');
        setSelectedIntern(null);
        fetchInterns();
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to submit evaluation');
      }
    } catch (error) {
      console.error(error);
      showError('Network error while submitting evaluation');
    } finally {
      setSubmitting(false);
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

  const isFileAttachment = (url: string, title: string) => {
    return title.startsWith('[File]') || url.includes('/uploads/') || /\.(pdf|png|jpg|jpeg|doc|docx|zip)$/i.test(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-100">
              Mentor Supervision
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {interns.length} Active Interns Placed
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Internship Logbook Review & Rubrics
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Review weekly planned objectives, deliverables, problem-solving, and submit performance evaluations.
          </p>
        </div>
      </div>

      {/* ── Interns Table ──────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Student & University</th>
                  <th className="px-6 py-4">Position Title</th>
                  <th className="px-6 py-4">Hours Logged & Signed</th>
                  <th className="px-6 py-4">Company Rubric Status</th>
                  <th className="px-6 py-4 text-right">Supervision Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {interns.length > 0 ? (
                  interns.map((intern) => {
                    const percent = Math.min(100, Math.round((intern.totalHours / intern.targetHours) * 100));
                    const isEvaluated = !!intern.evaluation;

                    return (
                      <tr key={intern.applicationId} className="hover:bg-slate-50/60 transition-colors">
                        {/* Student Name & Avatar */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setViewingStudentId(intern.student.id || intern.student.user.id || null)}
                              className="w-10 h-10 rounded-xl bg-white p-0.5 border border-slate-200 shadow-2xs flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:border-primary-400 hover:scale-105 transition-all"
                              title="View Student Profile"
                            >
                              {intern.student.avatarUrl || intern.student.user.avatarUrl ? (
                                <img
                                  src={(intern.student.avatarUrl || intern.student.user.avatarUrl)!.startsWith('http') ? (intern.student.avatarUrl || intern.student.user.avatarUrl)! : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${intern.student.avatarUrl || intern.student.user.avatarUrl}`}
                                  alt={intern.student.user.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-inner">
                                  {intern.student.user.name ? intern.student.user.name.charAt(0).toUpperCase() : 'S'}
                                </div>
                              )}
                            </button>

                            <div>
                              <button
                                type="button"
                                onClick={() => setViewingStudentId(intern.student.id || intern.student.user.id || null)}
                                className="font-black text-slate-900 text-sm hover:text-primary-600 transition-colors text-left cursor-pointer block"
                              >
                                {intern.student.user.name}
                              </button>
                              <div className="text-slate-500 text-xs font-semibold">
                                {intern.student.studentId} • {intern.student.university.name}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {intern.student.faculty} ({intern.student.major})
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Position */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <span className="font-bold text-slate-800 text-xs block">
                            {intern.jobTitle}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            Target: {intern.targetHours} Hours
                          </span>
                        </td>

                        {/* Hours */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-slate-900 text-xs">
                              {intern.totalHours} hrs
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {intern.approvedHours} hrs approved
                            </span>
                          </div>
                          <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-primary-600 h-full rounded-full" 
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </td>

                        {/* Rubric Status */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          {isEvaluated ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Rubric Submitted
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                              Pending Evaluation
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4.5 whitespace-nowrap text-right space-x-2">
                          <button
                            onClick={() => openLogsModal(intern)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Review Logbook ({intern.student.weeklyLogs?.length || 0})
                          </button>
                          <button
                            onClick={() => openEvaluationModal(intern)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                          >
                            {isEvaluated ? 'Edit Rubric' : 'Evaluate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-slate-700">No active interns found.</p>
                      <p className="text-xs text-slate-400 mt-0.5">Approved applicants will appear here for weekly supervision.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Logbook Review Drawer Modal ────────────────────────────────────── */}
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
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
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
                    const plannedItems = parsePinPoints(log.plannedTasks);
                    const actualItems = parsePinPoints(log.tasksDone);
                    const linkItems = parseAttachmentLinks(log.attachmentUrl);

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
                                className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                              >
                                Sign Off Week
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Planned vs Actual (Pin Points) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 space-y-1.5">
                            <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                              🎯 Planned Objectives:
                            </p>
                            {plannedItems.length > 0 ? (
                              <ul className="space-y-1 text-slate-700">
                                {plannedItems.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1 shrink-0"></span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-slate-400 italic">No planned objectives recorded.</p>
                            )}
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 space-y-1.5">
                            <p className="font-bold text-[10px] text-primary-600 uppercase tracking-wider">
                              ✅ Tasks & Deliverables Completed:
                            </p>
                            <ul className="space-y-1 text-slate-700">
                              {actualItems.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Problems & Solutions AND Key Learnings (Both Guaranteed Visible) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-xl">
                            <p className="font-bold text-amber-900 mb-0.5 flex items-center gap-1">
                              ⚠️ Problems Encountered & Solutions:
                            </p>
                            <p className="text-amber-800 whitespace-pre-line leading-relaxed">
                              {log.problemsAndSolutions || 'No specific blockers reported this week.'}
                            </p>
                          </div>
                          <div className="bg-indigo-50/60 border border-indigo-100 p-3.5 rounded-xl">
                            <p className="font-bold text-indigo-900 mb-0.5 flex items-center gap-1">
                              💡 Key Learnings & Technical Growth:
                            </p>
                            <p className="text-indigo-800 whitespace-pre-line leading-relaxed">
                              {log.learnings || 'General internship duties and routine progress.'}
                            </p>
                          </div>
                        </div>

                        {/* Attached Artifacts & Deliverables (Visible in Company Portal!) */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                          <p className="font-bold text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <LinkIcon className="w-3 h-3 text-primary-500" />
                            Attached Artifacts & Deliverables ({linkItems.length})
                          </p>
                          {linkItems.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {linkItems.map((link, idx) => {
                                const isFile = isFileAttachment(link.url, link.title);
                                return (
                                  <a
                                    key={idx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 border border-primary-200 text-xs font-bold text-primary-700 shadow-2xs transition-all"
                                  >
                                    {isFile ? <FileText className="w-3.5 h-3.5 text-indigo-600" /> : <ExternalLink className="w-3.5 h-3.5" />}
                                    {link.title || 'View Attached Artifact'}
                                  </a>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-slate-400 italic text-[11px]">No attached files or links for this week.</p>
                          )}
                        </div>

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
                                    className={`p-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
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
                                className="px-3 py-1.5 border border-emerald-300 bg-white text-emerald-800 text-xs font-bold rounded-lg cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={approvingSubmitting}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
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

      {/* ── Final Evaluation Rubric Modal ──────────────────────────────────── */}
      {selectedIntern && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-7 py-5 bg-gradient-to-r from-slate-900 to-slate-950 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400">
                  Host Organization Assessment
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  {selectedIntern.student.user.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedIntern(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="p-7 space-y-5">
              {/* Score 1: Work Quality */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Work Quality & Technical Competence (1-5)
                  </label>
                  <span className="text-xs font-black text-primary-600">{workQuality} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  value={workQuality}
                  onChange={(e) => setWorkQuality(Number(e.target.value))}
                />
              </div>

              {/* Score 2: Punctuality */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Punctuality & Reliability (1-5)
                  </label>
                  <span className="text-xs font-black text-primary-600">{punctuality} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  value={punctuality}
                  onChange={(e) => setPunctuality(Number(e.target.value))}
                />
              </div>

              {/* Score 3: Teamwork */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Teamwork & Communication (1-5)
                  </label>
                  <span className="text-xs font-black text-primary-600">{teamwork} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  value={teamwork}
                  onChange={(e) => setTeamwork(Number(e.target.value))}
                />
              </div>

              {/* Qualitative Feedback */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mentor Performance Remarks & Recommendation
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide detailed feedback on project deliverables, problem-solving, and general attitude..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedIntern(null)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:from-primary-700 hover:to-indigo-700 shadow-md shadow-primary-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Submit Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Student Profile Modal ───────────────────────────────────────────── */}
      <PublicProfileModal
        isOpen={!!viewingStudentId}
        onClose={() => setViewingStudentId(null)}
        profileType="student"
        profileId={viewingStudentId}
      />
    </div>
  );
}
