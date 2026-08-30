import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye, Building, Mail, Briefcase, Calendar, FileText, ExternalLink } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

interface Application {
  id: string;
  status: string;
  coverLetter?: string | null;
  createdAt: string;
  jobPost: { title: string };
  documents: { id: string; title: string; fileUrl: string; type?: string }[];
  student: {
    studentId: string;
    major: string;
    faculty: string;
    user: { name: string; email: string };
  };
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  REVIEWING: { label: 'Reviewing', color: 'bg-blue-100 text-blue-800' },
  ACCEPTED: { label: 'Accepted', color: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  APPROVED_BY_UNIVERSITY: { label: 'Uni Approved', color: 'bg-purple-100 text-purple-800' },
};

export default function CompanyApplicants() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
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
      if (res.ok) setApplications(await res.json());
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
      if (res.ok) {
        const label = status === 'ACCEPTED' ? 'accepted' : status === 'REJECTED' ? 'rejected' : 'updated';
        success(`Application ${label} successfully!`);
        fetchApplications();
      } else {
        showError('Failed to update application status.');
      }
    } catch (error) {
      showError('Network error. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Applicants</h2>
        <p className="text-gray-500 mt-1">Review and manage incoming applications.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : applications.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col gap-4 p-4">
          {applications.map(app => {
            const status = statusConfig[app.status] || statusConfig.PENDING;
            return (
              <div key={app.id} className="border border-gray-100 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{app.student.user.name}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center"><Mail className="w-4 h-4 mr-1 text-gray-400" /> {app.student.user.email}</span>
                      <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1 text-gray-400" /> {app.jobPost.title}</span>
                      <span className="flex items-center"><Calendar className="w-4 h-4 mr-1 text-gray-400" /> {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-2 items-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                      {app.documents && app.documents.length > 0 && app.documents.map((doc, dIdx) => {
                        const isLink = doc.fileUrl.startsWith('http://') || doc.fileUrl.startsWith('https://');
                        const url = isLink ? doc.fileUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${doc.fileUrl}`;
                        return (
                          <a 
                            key={doc.id || dIdx}
                            href={url}
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

                  <div className="flex items-center gap-2 flex-wrap">
                    {app.status === 'PENDING' && (
                      <button onClick={() => updateStatus(app.id, 'REVIEWING')} className="px-3 py-1.5 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors flex items-center">
                        <Eye className="w-4 h-4 mr-1" /> Review
                      </button>
                    )}
                    {(app.status === 'PENDING' || app.status === 'REVIEWING') && (
                      <>
                        <button onClick={() => updateStatus(app.id, 'ACCEPTED')} className="px-3 py-1.5 border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" /> Accept
                        </button>
                        <button onClick={() => updateStatus(app.id, 'REJECTED')} className="px-3 py-1.5 border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors flex items-center">
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </button>
                      </>
                    )}
                    {app.status === 'ACCEPTED' && (
                      <span className="text-gray-400 text-sm italic">Waiting for Uni approval</span>
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
    </div>
  );
}
