import { useEffect, useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  Search, 
  DollarSign, 
  Send, 
  UploadCloud, 
  CheckCircle2, 
  X, 
  Users, 
  FileCheck
} from 'lucide-react';

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
  const [filterType, setFilterType] = useState<'all' | 'remote' | 'onsite'>('all');

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<boolean>(false);

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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'remote') return matchesSearch && job.isRemote;
    if (filterType === 'onsite') return matchesSearch && !job.isRemote;
    return matchesSearch;
  });

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ── Header & Search Controls ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-100">
              Job Board
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {jobs.length} Opportunities Open
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Find Your Next Internship
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Browse verified company postings and apply directly with 1-click.
          </p>
        </div>

        {/* Search Bar & Filter Chips */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by role, company, location..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto justify-center">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({jobs.length})
            </button>
            <button
              onClick={() => setFilterType('remote')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'remote' ? 'bg-white text-primary-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Remote
            </button>
            <button
              onClick={() => setFilterType('onsite')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'onsite' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              On-site
            </button>
          </div>
        </div>
      </div>

      {/* ── Job Cards Grid ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-200"></div>
                <div className="w-20 h-6 rounded-full bg-slate-100"></div>
              </div>
              <div className="h-5 w-3/4 bg-slate-200 rounded"></div>
              <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
              <div className="h-16 w-full bg-slate-50 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <div 
                key={job.id} 
                className="bg-white rounded-3xl shadow-sm border border-slate-200/80 hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div className="p-6 sm:p-7 space-y-4">
                  {/* Top Row: Company Avatar & Tag */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-md shadow-primary-500/20 flex-shrink-0">
                      {job.company.companyName.charAt(0)}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {job.isRemote ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          🌐 Remote
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          📍 On-site
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Company Name */}
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-primary-500" />
                      {job.company.companyName}
                    </p>
                  </div>

                  {/* Key Info Chips */}
                  <div className="flex flex-wrap gap-2 pt-1 text-xs text-slate-600 font-medium">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100">
                      <Users className="w-3 h-3 text-slate-400" />
                      {job.positions} Slot{job.positions > 1 ? 's' : ''}
                    </span>
                    {job.allowance && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50/70 text-emerald-800 border border-emerald-100 font-semibold">
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        {job.allowance}
                      </span>
                    )}
                  </div>

                  {/* Job Description Preview */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 bg-slate-50/60 p-3.5 rounded-2xl border border-slate-100">
                    {job.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0">
                  <button 
                    onClick={() => setSelectedJobId(job.id)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold text-sm py-3 rounded-2xl hover:from-primary-700 hover:to-indigo-700 shadow-md shadow-primary-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    Apply for Position
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-900">No internships found</h4>
              <p className="text-xs text-slate-500 mt-1">Try modifying your search or filter options.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Modern Application Modal ───────────────────────────────────────── */}
      {selectedJobId && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100 my-8">
            {/* Modal Header */}
            <div className="px-7 py-5 bg-gradient-to-r from-slate-900 to-slate-950 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400">
                  Submit Application
                </span>
                <h3 className="text-lg font-extrabold text-white leading-tight">
                  {selectedJob.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedJob.company.companyName} • {selectedJob.location}
                </p>
              </div>
              <button 
                onClick={() => setSelectedJobId(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={submitApplication} className="p-7 space-y-5">
              {modalError && (
                <div className="p-4 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2">
                  <X className="w-4 h-4 flex-shrink-0" />
                  {modalError}
                </div>
              )}
              {modalSuccess && (
                <div className="p-4 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  Application submitted successfully! Redirecting...
                </div>
              )}

              {/* Cover Letter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Cover Letter / Introduction (Optional)
                </label>
                <textarea 
                  rows={4}
                  className="w-full border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none shadow-2xs"
                  placeholder="Share a short note on why you're interested in this internship and your key qualifications..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                ></textarea>
              </div>
              
              {/* CV File Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Attach Resume / CV (PDF or DOC)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50/60 transition-colors relative">
                  <input 
                    type="file" 
                    id="cvUpload"
                    accept=".pdf,.doc,.docx"
                    className="sr-only" 
                    onChange={(e) => setCvFile(e.target.files ? e.target.files[0] : null)} 
                  />
                  <label htmlFor="cvUpload" className="cursor-pointer block">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-2">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    {cvFile ? (
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600">
                        <FileCheck className="w-4 h-4" />
                        <span>{cvFile.name} ({(cvFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-primary-600 hover:text-primary-700">
                          Click to browse and upload file
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">PDF or Word files up to 5 MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setSelectedJobId(null)} 
                  className="flex-1 px-5 py-3 border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploading || modalSuccess} 
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold text-xs rounded-2xl hover:from-primary-700 hover:to-indigo-700 shadow-md shadow-primary-500/20 transition-all disabled:opacity-50"
                >
                  {uploading ? (
                    <span>Uploading & Submitting...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

