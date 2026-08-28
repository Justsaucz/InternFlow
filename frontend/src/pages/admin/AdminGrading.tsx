import { useEffect, useState } from 'react';
import { 
  Building2, 
  Printer, 
  Search, 
  X
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

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

  // Grade Form State
  const [finalGrade, setFinalGrade] = useState('S');
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
      setFinalGrade(placement.evaluation.finalGrade || 'S');
      setRemarks(placement.evaluation.universityRemarks || '');
    } else {
      setFinalGrade('S');
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

  const handleOpenReport = async (studentId: string) => {
    setReportLoading(true);
    setReportModalOpen(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/evaluations/report/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (error) {
      console.error(error);
      showError('Failed to load completion report');
    } finally {
      setReportLoading(false);
    }
  };

  const filteredPlacements = placements.filter((p) => {
    const name = p.student.user.name.toLowerCase();
    const id = p.student.studentId.toLowerCase();
    const major = p.student.major.toLowerCase();
    const q = searchTerm.toLowerCase();
    return name.includes(q) || id.includes(q) || major.includes(q);
  });

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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-100">
              Academic Oversight
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {university?.name || 'University Portal'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Internship Grading & Reports
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Inspect total accumulated hours, company evaluation rubrics, and award final course grades.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name or ID..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-900 focus:ring-2 focus:ring-primary-500 shadow-2xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── Placements Table ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Placement / Host</th>
                <th className="px-6 py-4">Hours Logged</th>
                <th className="px-6 py-4">Company Rubric</th>
                <th className="px-6 py-4">Final Grade</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPlacements.length > 0 ? (
                filteredPlacements.map((p) => {
                  const evalItem = p.evaluation;
                  const companyScore = evalItem 
                    ? ((evalItem.workQualityScore + evalItem.punctualityScore + evalItem.teamworkScore) / 3).toFixed(1)
                    : null;

                  return (
                    <tr key={p.student.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Student Info */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 font-bold flex items-center justify-center">
                            {p.student.user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{p.student.user.name}</p>
                            <p className="text-slate-500 text-[11px]">ID: {p.student.studentId} • {p.student.major}</p>
                          </div>
                        </div>
                      </td>

                      {/* Host Company */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        {p.activeApp ? (
                          <div>
                            <p className="font-bold text-slate-800">{p.activeApp.jobPost.title}</p>
                            <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {p.activeApp.jobPost.company.companyName}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No placement</span>
                        )}
                      </td>

                      {/* Hours */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{p.totalHours}</span>
                          <span className="text-slate-400">/ 400 hrs</span>
                        </div>
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full" 
                            style={{ width: `${Math.min(100, (p.totalHours / 400) * 100)}%` }}
                          ></div>
                        </div>
                      </td>

                      {/* Company Rubric */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        {evalItem ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                              ★ {companyScore} / 5.0
                            </span>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[11px]">
                            Pending Evaluation
                          </span>
                        )}
                      </td>

                      {/* Final Grade */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        {evalItem?.finalGrade ? (
                          <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-black text-xs">
                            Grade: {evalItem.finalGrade}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Not Graded</span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4.5 whitespace-nowrap text-right space-x-2">
                        {evalItem && (
                          <button
                            onClick={() => handleOpenGrading(p)}
                            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs transition-colors"
                          >
                            {evalItem.finalGrade ? 'Edit Grade' : 'Assign Grade'}
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenReport(p.student.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                        >
                          Official Report
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No student placement records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                className="w-8 h-8 rounded-full bg-purple-950 text-purple-300 hover:text-white flex items-center justify-center transition-colors"
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
                  Awarded Grade
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['S', 'U', 'A', 'B+', 'B', 'C+', 'C', 'D'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFinalGrade(g)}
                      className={`py-2.5 rounded-xl text-xs font-black border transition-all ${
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
                  className="flex-1 px-5 py-3 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingGrade}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-500/20"
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setReportModalOpen(false)}
                  className="text-slate-400 hover:text-white text-sm font-bold ml-2"
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
