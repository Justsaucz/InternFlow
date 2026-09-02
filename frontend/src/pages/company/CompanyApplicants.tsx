import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye, Building, Mail, Briefcase, Calendar, FileText, ExternalLink, Clock, AlertTriangle, UserCheck } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import PublicProfileModal from '../../components/modals/PublicProfileModal';

interface Application {
  id: string;
  status: string;
  coverLetter?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  jobPost: { title: string };
  documents: { id: string; title: string; fileUrl: string; type?: string }[];
  student: {
    id: string;
    studentId: string;
    major: string;
    faculty: string;
    university?: string | null;
    avatarUrl?: string | null;
    userId?: string;
    user: { id?: string; name: string; email: string; avatarUrl?: string | null };
  };
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
  REVIEWING: { label: 'Under Review', color: 'bg-blue-100 text-blue-800' },
  ACCEPTED: { label: 'Offer Extended', color: 'bg-amber-100 text-amber-800' },
  COMMITTED: { label: 'Active Intern', color: 'bg-emerald-100 text-emerald-800' },
  CANCEL_REQUESTED: { label: 'Cancellation Requested', color: 'bg-rose-100 text-rose-800' },
  CANCELLED: { label: 'Cancelled / Released', color: 'bg-gray-100 text-gray-700' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
};

export default function CompanyApplicants() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/applications/company`, {
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

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/applications/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) {
        const label = status === 'ACCEPTED' ? 'accepted' : status === 'REJECTED' ? 'rejected' : 'updated';
        success(`Application ${label} successfully!`);
        fetchApplications();
      } else {
        showError(data.error || 'Failed to update application status.');
      }
    } catch (error) {
      showError('Network error. Please try again.');
      console.error(error);
    }
  };

  const handleCancellationAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/applications/${id}/cancellation-action`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (res.ok) {
        success(data.message || 'Updated successfully');
        fetchApplications();
      } else {
        showError(data.error || 'Failed to process cancellation action');
      }
    } catch (error) {
      showError('Network error. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Applicants & Active Interns</h2>
        <p className="text-gray-500 mt-1">Review candidate applications, extend internship offers, and manage intern placements.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : applications.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {applications.map((app) => {
            const status = statusConfig[app.status] || { label: app.status, color: 'bg-gray-100 text-gray-800' };

            return (
              <div key={app.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => setViewingStudentId(app.student.userId || app.student.id)}
                      className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary-400 transition-all"
                      title="View Student Profile"
                    >
                      {app.student.user.avatarUrl ? (
                        <img 
                          src={app.student.user.avatarUrl.startsWith('http') ? app.student.user.avatarUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${app.student.user.avatarUrl}`} 
                          alt={app.student.user.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        app.student.user.name.charAt(0)
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setViewingStudentId(app.student.userId || app.student.id)}
                          className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors text-left cursor-pointer"
                        >
                          {app.student.user.name}
                        </button>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="mt-1 text-sm text-gray-500 space-y-1">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-700">{app.jobPost.title}</span>
                          <span>•</span>
                          <span>{app.student.major}, {app.student.faculty}</span>
                        </div>
                        {app.student.university && (
                          <div className="text-xs text-gray-400">
                            {app.student.university}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {app.student.user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            Applied {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {app.coverLetter && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-xl text-xs text-gray-600 max-w-xl">
                          <span className="font-semibold text-gray-700">Cover Letter: </span>
                          "{app.coverLetter}"
                        </div>
                      )}

                      {/* Cancellation Request Notice Box */}
                      {app.status === 'CANCEL_REQUESTED' && (
                        <div className="mt-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1 max-w-xl">
                          <div className="font-bold flex items-center gap-1.5 text-amber-800">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            Student requested to cancel this internship:
                          </div>
                          <p className="italic text-slate-700 bg-white/80 p-2 rounded-lg border border-amber-100">
                            "{app.cancellationReason || 'No reason specified'}"
                          </p>
                          <p className="text-[11px] text-amber-700">
                            Action required: Choose to approve their release or decline the cancellation request.
                          </p>
                        </div>
                      )}

                      {/* Documents / Pin-Point Attachments */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {app.documents?.map((doc, idx) => {
                          const isLink = doc.fileUrl.startsWith('http://') || doc.fileUrl.startsWith('https://');
                          const docUrl = isLink ? doc.fileUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${doc.fileUrl}`;
                          return (
                            <a 
                              key={doc.id || idx}
                              href={docUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-1 transition-colors"
                            >
                              {isLink ? <ExternalLink className="w-3 h-3 text-indigo-600" /> : <FileText className="w-3 h-3 text-indigo-600" />}
                              <span>{doc.title || 'Attachment'}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions Right Side */}
                  <div className="flex items-center gap-2 flex-wrap self-start">
                    {app.status === 'PENDING' && (
                      <button onClick={() => updateStatus(app.id, 'REVIEWING')} className="px-3 py-1.5 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors flex items-center cursor-pointer">
                        <Eye className="w-3.5 h-3.5 mr-1" /> Review
                      </button>
                    )}
                    {(app.status === 'PENDING' || app.status === 'REVIEWING') && (
                      <>
                        <button onClick={() => updateStatus(app.id, 'ACCEPTED')} className="px-3 py-1.5 border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 rounded-xl text-xs font-bold transition-colors flex items-center cursor-pointer">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Extend Offer
                        </button>
                        <button onClick={() => updateStatus(app.id, 'REJECTED')} className="px-3 py-1.5 border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors flex items-center cursor-pointer">
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </button>
                      </>
                    )}
                    {app.status === 'ACCEPTED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200">
                        <Clock className="w-3.5 h-3.5" /> Offer Extended (Awaiting Student)
                      </span>
                    )}
                    {app.status === 'COMMITTED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        <UserCheck className="w-3.5 h-3.5" /> Active Intern (Confirmed)
                      </span>
                    )}
                    {app.status === 'CANCEL_REQUESTED' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCancellationAction(app.id, 'APPROVE')}
                          className="px-3 py-1.5 border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors flex items-center cursor-pointer shadow-xs"
                          title="Approve cancellation and release student"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve Release
                        </button>
                        <button
                          onClick={() => handleCancellationAction(app.id, 'REJECT')}
                          className="px-3 py-1.5 border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors flex items-center cursor-pointer"
                          title="Decline cancellation request"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                        </button>
                      </div>
                    )}
                    {app.status === 'CANCELLED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200">
                        <XCircle className="w-3.5 h-3.5" /> Placement Cancelled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
          <p className="mt-1 text-sm text-gray-500">Applicants will appear here once students apply to your jobs.</p>
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
