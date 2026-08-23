import { useEffect, useState } from 'react';
import { CheckCircle, Clock, Users, FileText } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

interface Application {
  id: string;
  status: string;
  createdAt: string;
  jobPost: {
    title: string;
    company: { companyName: string };
  };
  student: {
    major: string;
    faculty: string;
    user: { name: string; email: string };
  };
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  REVIEWING: { label: 'Reviewing', color: 'bg-blue-100 text-blue-800' },
  ACCEPTED: { label: 'Accepted by Company', color: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  APPROVED_BY_UNIVERSITY: { label: 'Approved', color: 'bg-purple-100 text-purple-800' },
};

export default function AdminApprovals() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/applications/university`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setApplications(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveApplication = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/applications/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        success('Application approved successfully!');
        fetchApplications();
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to approve application');
      }
    } catch (err) {
      showError('Network error. Please try again.');
      console.error(err);
    }
  };

  const acceptedApps = applications.filter(a => a.status === 'ACCEPTED');
  const allApps = applications;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Approval Requests</h2>
        <p className="text-gray-500 mt-1">Review and approve internship placements for your students.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <Users className="w-8 h-8 text-primary-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Total Applications</p>
            <p className="text-xl font-bold text-gray-900">{allApps.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <Clock className="w-8 h-8 text-yellow-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Awaiting Approval</p>
            <p className="text-xl font-bold text-gray-900">{acceptedApps.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-xl font-bold text-gray-900">{applications.filter(a => a.status === 'APPROVED_BY_UNIVERSITY').length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : allApps.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allApps.map(app => {
                const status = statusConfig[app.status] || statusConfig.PENDING;
                return (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{app.student.user.name}</div>
                      <div className="text-sm text-gray-500">{app.student.major || '-'} / {app.student.faculty || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{app.jobPost.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.jobPost.company.companyName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {app.status === 'ACCEPTED' ? (
                        <button onClick={() => approveApplication(app.id)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors text-xs font-bold">
                          Approve Placement
                        </button>
                      ) : app.status === 'APPROVED_BY_UNIVERSITY' ? (
                        <span className="text-green-600 font-medium text-xs">✓ Approved</span>
                      ) : (
                        <span className="text-gray-400 text-xs">No action required</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No applications from your students</h3>
        </div>
      )}
    </div>
  );
}
