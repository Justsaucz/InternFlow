import { useEffect, useState } from 'react';
import { 
  Building2, 
  Printer, 
  Search, 
  X,
  CheckCircle2,
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

interface StudentData {
  id: string;
  studentId: string;
  major: string;
  faculty: string;
  year: number;
  user: { name: string; email: string };
  university: { name: string };
}

interface PlacementItem {
  student: StudentData;
  activeApp: any;
  totalHours: number;
  approvedHours: number;
  targetHours: number;
  evaluation: any;
}

export default function AdminGrading() {
  const [placements, setPlacements] = useState<PlacementItem[]>([]);
  const [university, setUniversity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlacement, setSelectedPlacement] = useState<PlacementItem | null>(null);
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // University Logbook Inspection State
  const [selectedStudentForLogs, setSelectedStudentForLogs] = useState<PlacementItem | null>(null);
  const [studentLogs, setStudentLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [verifyingLogId, setVerifyingLogId] = useState<string | null>(null);
  const [facultyRemarks, setFacultyRemarks] = useState('');
  const [verifyingSubmitting, setVerifyingSubmitting] = useState(false);

  // Grade Form State
  const [finalGrade, setFinalGrade] = useState('A');
  const [remarks, setRemarks] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchGradingOverview();
  }, []);

  const fetchGradingOverview = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/evaluations/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPlacements(data.placements || []);
        setUniversity(data.university || null);
      }
    } catch (error) {
      console.error(error);
      showError('Failed to load grading overview');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGrading = (placement: PlacementItem) => {
    setSelectedPlacement(placement);
    if (placement.evaluation) {
      setFinalGrade(placement.evaluation.finalGrade || 'A');
      setRemarks(placement.evaluation.universityRemarks || '');
    } else {
      setFinalGrade('A');
      setRemarks('');
    }
    setGradingModalOpen(true);
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlacement || !selectedPlacement.evaluation) {
      showError('Cannot grade placement without company evaluation record');
      return;
    }

    setSavingGrade(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/evaluations/${selectedPlacement.evaluation.id}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          finalGrade,
          universityRemarks: remarks
        })
      });

      if (res.ok) {
        success('Final grade recorded successfully!');
        setGradingModalOpen(false);
        fetchGradingOverview();
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to save grade');
      }
    } catch (error) {
      showError('Network error while saving grade');
    } finally {
      setSavingGrade(false);
    }
  };

  const openLogbookInspector = async (placement: PlacementItem) => {
    setSelectedStudentForLogs(placement);
    setLogsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/logbook/student/${placement.student.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudentLogs(data.logs || []);
      }
    } catch (error) {
      console.error(error);
      showError('Failed to fetch student logbook');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleFacultyVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingLogId) return;

    setVerifyingSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/logbook/verify/${verifyingLogId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          facultyRemarks
        })
      });

      if (res.ok) {
        success('Weekly log faculty verification recorded!');
        setVerifyingLogId(null);
        if (selectedStudentForLogs) {
          openLogbookInspector(selectedStudentForLogs);
        }
        fetchGradingOverview();
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to verify log');
      }
    } catch (error) {
      showError('Network error while verifying log');
    } finally {
      setVerifyingSubmitting(false);
    }
  };

  const handleOpenReport = async (placement: PlacementItem) => {
    setSelectedPlacement(placement);
    setReportLoading(true);
    setReportModalOpen(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/evaluations/report/${placement.student.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      } else {
        showError('Failed to load official report');
      }
    } catch (error) {
      console.error(error);
      showError('Network error loading report');
    } finally {
      setReportLoading(false);
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

  const filteredPlacements = placements.filter(p => 
    p.student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.student.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.activeApp?.jobPost?.company?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
              Academic Assessment Committee
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {placements.length} Total Internship Placements
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Academic Grading & Dual Verification
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Audit weekly operational logs, verify curriculum alignment, review employer rubrics, and award final letter grades.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student, ID, company..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── Placements & Grading Table ─────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Student & Major</th>
                  <th className="px-6 py-4">Placement Organization</th>
                  <th className="px-6 py-4">Hours & Dual Verification</th>
                  <th className="px-6 py-4">Employer Rubric</th>
                  <th className="px-6 py-4">Academic Grade</th>
                  <th className="px-6 py-4 text-right">Committee Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPlacements.length > 0 ? (
                  filteredPlacements.map((p) => {
                    const percent = Math.min(100, Math.round((p.totalHours / p.targetHours) * 100));
                    const isEvaluated = !!p.evaluation;
                    const finalGradeVal = p.evaluation?.finalGrade;

                    return (
                      <tr key={p.student.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Student */}
                        <td className="px-6 py-4.5">
                          <div className="font-black text-slate-900 text-sm">
                            {p.student.user.name}
                          </div>
                          <div className="text-slate-500 font-bold">
                            {p.student.studentId} • Year {p.student.year}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {p.student.faculty} ({p.student.major})
                          </div>
                        </td>

                        {/* Company */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          {p.activeApp ? (
                            <div>
                              <span className="font-bold text-slate-800 flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-primary-600" />
                                {p.activeApp.jobPost?.company?.companyName}
                              </span>
                              <span className="text-[11px] text-slate-500 block mt-0.5">
                                Role: {p.activeApp.jobPost?.title}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No placement</span>
                          )}
                        </td>

                        {/* Hours & Progress */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-slate-900 text-xs">
                              {p.totalHours} / {p.targetHours} hrs
                            </span>
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                              {p.approvedHours} hrs signed
                            </span>
                          </div>
                          <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-purple-600 h-full rounded-full" 
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </td>

                        {/* Company Evaluation */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          {isEvaluated ? (
                            <div>
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1 text-[11px]">
                                <CheckCircle2 className="w-3 h-3" />
                                Score: {(p.evaluation.workQualityScore + p.evaluation.punctualityScore + p.evaluation.teamworkScore) / 3}/5
                              </span>
                              <div className="text-[10px] text-slate-500 mt-1">
                                Q: {p.evaluation.workQualityScore} • P: {p.evaluation.punctualityScore} • T: {p.evaluation.teamworkScore}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              Pending Employer
                            </span>
                          )}
                        </td>

                        {/* Academic Grade */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          {finalGradeVal ? (
                            <span className="px-3 py-1 font-black text-sm rounded-xl bg-purple-100 text-purple-900 border border-purple-300">
                              Grade {finalGradeVal}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-xs">Ungraded</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4.5 whitespace-nowrap text-right space-x-2">
                          <button
                            onClick={() => openLogbookInspector(p)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Inspect Logs
                          </button>

                          {isEvaluated && (
                            <button
                              onClick={() => handleOpenGrading(p)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                            >
                              {finalGradeVal ? 'Edit Grade' : 'Assign Grade'}
                            </button>
                          )}

                          {isEvaluated && (
                            <button
                              onClick={() => handleOpenReport(p)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs transition-colors cursor-pointer"
                            >
                              <Printer className="w-3 h-3" />
                              Certificate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                      <Search className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-slate-700">No student placement records found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── University Logbook Inspector Modal ──────────────────────────────── */}
      {selectedStudentForLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-7 py-5 bg-gradient-to-r from-purple-900 to-slate-950 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                  Academic Logbook Inspector & Dual Verification
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  {selectedStudentForLogs.student.user.name} ({selectedStudentForLogs.student.studentId})
                </h3>
              </div>
              <button 
                onClick={() => { setSelectedStudentForLogs(null); setVerifyingLogId(null); }}
                className="w-8 h-8 rounded-full bg-purple-950 text-purple-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-7 space-y-6 max-h-[75vh] overflow-y-auto">
              {logsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
                        {/* Header */}
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
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-slate-200 text-purple-700 shadow-2xs">
                              {log.hoursWorked} Hours
                            </span>

                            {log.facultyVerified ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Faculty Verified ✓
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setVerifyingLogId(log.id);
                                  setFacultyRemarks(log.facultyRemarks || '');
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                              >
                                Verify & Add Remarks
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

                        {/* Attached Artifacts & Deliverables (Guaranteed Visible) */}
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

                        {/* Mentor & Faculty Feedback */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-emerald-900">
                            <p className="font-bold text-[10px] uppercase flex items-center justify-between">
                              <span>Company Mentor Review:</span>
                              {log.mentorRating && <span>{log.mentorRating} ★</span>}
                            </p>
                            <p className="italic text-[11px] mt-0.5">
                              {log.mentorFeedback ? `"${log.mentorFeedback}"` : 'Pending company feedback.'}
                            </p>
                          </div>
                          <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100 text-purple-900">
                            <p className="font-bold text-[10px] uppercase flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />
                              Faculty Advisor Remarks:
                            </p>
                            <p className="italic text-[11px] mt-0.5">
                              {log.facultyRemarks ? `"${log.facultyRemarks}"` : 'Pending faculty review.'}
                            </p>
                          </div>
                        </div>

                        {/* Inline Faculty Verification Form */}
                        {verifyingLogId === log.id && (
                          <form onSubmit={handleFacultyVerify} className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200 space-y-3 mt-2 animate-in fade-in">
                            <span className="text-xs font-black text-purple-900 block">
                              Faculty Verification & Academic Advice (Week {log.weekNumber})
                            </span>

                            <textarea
                              rows={2}
                              required
                              placeholder="Add academic remarks, confirm alignment with curriculum, and verify progress..."
                              className="w-full border border-purple-300 bg-white rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500"
                              value={facultyRemarks}
                              onChange={(e) => setFacultyRemarks(e.target.value)}
                            ></textarea>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setVerifyingLogId(null)}
                                className="px-3 py-1.5 border border-purple-300 bg-white text-purple-800 text-xs font-bold rounded-lg cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={verifyingSubmitting}
                                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                              >
                                {verifyingSubmitting ? 'Verifying...' : 'Confirm Faculty Verification'}
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

      {/* ── Assign Grade Modal ──────────────────────────────────────────────── */}
      {gradingModalOpen && selectedPlacement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-7 py-5 bg-gradient-to-r from-purple-900 to-indigo-950 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                  Academic Assessment
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  Assign Final Grade
                </h3>
              </div>
              <button 
                onClick={() => setGradingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-purple-950 text-purple-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="p-7 space-y-5">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Student Candidate</p>
                <p className="text-base font-extrabold text-slate-900 mt-0.5">{selectedPlacement.student.user.name}</p>
                <p className="text-xs text-slate-400">ID: {selectedPlacement.student.studentId} • {selectedPlacement.student.major}</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Awarded Grade (A-F)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFinalGrade(g)}
                      className={`py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        finalGrade === g
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Academic Committee Remarks / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Successfully fulfilled all 400 internship hours with outstanding employer feedback..."
                  className="w-full border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-purple-500"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setGradingModalOpen(false)}
                  className="flex-1 px-5 py-3 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingGrade}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {savingGrade ? 'Recording...' : 'Confirm Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Official Report Modal ─────────────────────────────────────────── */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 my-8 print:shadow-none print:border-none print:m-0">
            {/* Top Bar (Hidden in Print) */}
            <div className="px-7 py-4 bg-slate-900 text-white flex justify-between items-center print:hidden">
              <span className="text-xs font-bold">Official Internship Completion Report</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setReportModalOpen(false)}
                  className="text-slate-400 hover:text-white text-sm font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Body */}
            {reportLoading ? (
              <div className="p-16 text-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                Generating official certificate & assessment record...
              </div>
            ) : reportData ? (
              <div className="p-10 space-y-8 bg-white text-slate-900 font-sans">
                <div className="border-b-2 border-slate-900 pb-6 text-center space-y-1">
                  <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">
                    {reportData.student?.university?.name || university?.name || 'University'}
                  </h1>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Faculty of {reportData.student?.faculty} • Department of {reportData.student?.major}
                  </p>
                  <h2 className="text-lg font-extrabold text-primary-700 pt-2">
                    Official Internship Completion Certificate & Assessment Report
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="space-y-1.5">
                    <p><span className="font-bold text-slate-500">Student Name:</span> <span className="font-extrabold">{reportData.student?.user?.name}</span></p>
                    <p><span className="font-bold text-slate-500">Student ID:</span> {reportData.student?.studentId}</p>
                    <p><span className="font-bold text-slate-500">Academic Year:</span> Year {reportData.student?.year}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p><span className="font-bold text-slate-500">Host Organization:</span> <span className="font-extrabold">{reportData.activeApp?.jobPost?.company?.companyName || 'Corporate Partner'}</span></p>
                    <p><span className="font-bold text-slate-500">Position Title:</span> {reportData.activeApp?.jobPost?.title || 'Intern'}</p>
                    <p><span className="font-bold text-slate-500">Total Hours Completed:</span> <span className="font-extrabold text-emerald-700">{reportData.totalHours} / 400 Hours</span></p>
                  </div>
                </div>

                {/* Dual Inspection Verification Summary in Certificate */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200">
                    <p className="font-bold text-emerald-900 uppercase text-[10px]">Company Sign-offs</p>
                    <p className="text-base font-black text-emerald-800 mt-0.5">
                      {reportData.weeklyLogs?.filter((l: any) => l.mentorApproved).length || 0} Weeks Approved
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-200">
                    <p className="font-bold text-purple-900 uppercase text-[10px]">Faculty Verifications</p>
                    <p className="text-base font-black text-purple-800 mt-0.5">
                      {reportData.weeklyLogs?.filter((l: any) => l.facultyVerified).length || 0} Weeks Verified
                    </p>
                  </div>
                </div>

                {reportData.evaluation && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                      Host Organization Assessment Rubric
                    </h3>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Work Quality</p>
                        <p className="text-xl font-black text-primary-600 mt-1">{reportData.evaluation.workQualityScore} / 5</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Punctuality</p>
                        <p className="text-xl font-black text-primary-600 mt-1">{reportData.evaluation.punctualityScore} / 5</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Teamwork</p>
                        <p className="text-xl font-black text-primary-600 mt-1">{reportData.evaluation.teamworkScore} / 5</p>
                      </div>
                    </div>
                    {reportData.evaluation.feedback && (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <p className="font-bold text-slate-600 mb-1">Company Supervisor Remarks:</p>
                        <p className="italic text-slate-700">"{reportData.evaluation.feedback}"</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-purple-900 uppercase tracking-wider">Final Academic Grade</p>
                    <p className="text-xs text-purple-700 mt-0.5">Assigned by University Internship Committee</p>
                  </div>
                  <div className="text-3xl font-black text-purple-900 bg-white px-5 py-2 rounded-xl shadow-xs border border-purple-200">
                    {reportData.evaluation?.finalGrade || 'PENDING'}
                  </div>
                </div>

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
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
