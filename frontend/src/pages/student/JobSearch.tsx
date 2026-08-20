import { useEffect, useState } from 'react';
import { Briefcase, MapPin, Building, Clock } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  isRemote: boolean;
  positions: number;
  allowance: string | null;
  createdAt: string;
  company: {
    companyName: string;
    logoUrl: string | null;
  };
}

export default function JobSearch() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    } finally {
      setLoading(false);
    }
  };

  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<boolean>(false);

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) return;
    
    setModalError(null);
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      let fileUrl = '';

      // 1. Upload CV if provided
      if (cvFile) {
        const formData = new FormData();
        formData.append('file', cvFile);
        
        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          fileUrl = uploadData.url;
        } else {
          setModalError('Failed to upload CV. Please try another file.');
          setUploading(false);
          return;
        }
      }

      // 2. Submit Application
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/applications`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          jobPostId: selectedJobId, 
          coverLetter: coverLetter,
          cvUrl: fileUrl
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setModalSuccess(true);
        setTimeout(() => {
          setSelectedJobId(null);
          setCoverLetter('');
          setCvFile(null);
          setModalSuccess(false);
        }, 1500);
      } else {
        setModalError(data.error || 'Failed to apply.');
      }
    } catch (error) {
      console.error(error);
      setModalError('An unexpected error occurred while applying.');
    } finally {
      setUploading(false);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Find Internships</h2>
          <p className="text-gray-500 mt-1">Discover and apply for your next opportunity.</p>
        </div>
        <div className="w-full md:w-96">
          <input
            type="text"
            placeholder="Search by role or company..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                <div className="p-6 flex-grow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{job.title}</h3>
                      <p className="text-primary-600 font-medium text-sm mt-1 flex items-center">
                        <Building className="w-4 h-4 mr-1" />
                        {job.company.companyName}
                      </p>
                    </div>
                    {job.company.logoUrl ? (
                      <img src={job.company.logoUrl} alt="Logo" className="w-12 h-12 rounded-md object-cover border border-gray-100" />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xl">
                        {job.company.companyName.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      {job.isRemote ? 'Remote' : job.location}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {job.positions} Position{job.positions > 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <p className="mt-4 text-gray-600 text-sm line-clamp-3">
                    {job.description}
                  </p>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                  <button 
                    onClick={() => setSelectedJobId(job.id)}
                    className="w-full bg-primary-600 text-white font-medium py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
              <p className="text-gray-500">No internships found matching your search.</p>
            </div>
          )}
        </div>
      )}

      {/* Application Modal */}
      {selectedJobId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Submit Application</h3>
              <button onClick={() => setSelectedJobId(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={submitApplication} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {modalError}
                </div>
              )}
              {modalSuccess && (
                <div className="p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                  Application submitted successfully!
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter (Optional)</label>
                <textarea 
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="Why are you a great fit for this role?"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resume / CV</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                        <span>Upload a file</span>
                        <input type="file" className="sr-only" onChange={(e) => setCvFile(e.target.files ? e.target.files[0] : null)} />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC up to 5MB</p>
                    {cvFile && <p className="text-sm text-green-600 font-medium mt-2">Selected: {cvFile.name}</p>}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setSelectedJobId(null)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50">
                  {uploading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
