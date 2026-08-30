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
  Clock,
  Mail,
  Phone,
  ExternalLink,
  MessageSquare,
  FileText,
  Plus,
  Trash2
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export interface AttachmentLink {
  title: string;
  url: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  isRemote: boolean;
  positions: number;
  allowance: string | null;
  workingHours: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactLine: string | null;
  applicationLink: string | null;
  createdAt: string;
  company: {
    companyName: string;
    logoUrl: string | null;
    address: string | null;
    industry: string | null;
    website: string | null;
  };
}

export default function JobSearch() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'remote' | 'onsite'>('all');

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [attachments, setAttachments] = useState<AttachmentLink[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<boolean>(false);
  const { success, error: showError } = useToast();

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

  // Attachment Pin-Point Handlers
  const handleAddAttachmentLink = () => {
    setAttachments([...attachments, { title: '', url: '' }]);
  };

  const handleAttachmentChange = (index: number, field: 'title' | 'url', val: string) => {
    const updated = [...attachments];
    updated[index] = { ...updated[index], [field]: val };
    setAttachments(updated);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showError('File size must be under 10MB');
      return;
    }

    setUploadingFile(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'CV');

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const result = await res.json();
        const fileUrl = result.document?.fileUrl || result.url;
        const newAttachment: AttachmentLink = {
          title: `[File] ${file.name}`,
          url: fileUrl
        };
        setAttachments([...attachments, newAttachment]);
        success(`Uploaded ${file.name} successfully!`);
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to upload file');
      }
    } catch (error) {
      showError('Network error uploading file');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const isFileAttachment = (link: AttachmentLink) => {
    return link.title.startsWith('[File]') || 
           link.url.includes('/uploads/') || 
           /\.(pdf|png|jpg|jpeg|doc|docx|zip)$/i.test(link.url);
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) return;
    
    setModalError(null);
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const validAttachments = attachments.filter(a => a.url && a.url.trim().length > 0);

      // Submit Application
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/applications`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          jobPostId: selectedJobId, 
          coverLetter: coverLetter,
          attachments: validAttachments,
          cvUrl: validAttachments[0]?.url || ''
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setModalSuccess(true);
        setTimeout(() => {
          setSelectedJobId(null);
          setCoverLetter('');
          setAttachments([]);
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
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
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
                    {job.workingHours && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50/70 text-indigo-800 border border-indigo-100 font-semibold">
                        <Clock className="w-3 h-3 text-indigo-600" />
                        {job.workingHours}
                      </span>
                    )}
                  </div>

                  {/* Contact Channels Badge (If available) */}
                  {(job.contactEmail || job.contactPhone || job.contactLine || job.applicationLink) && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                      <p className="font-bold text-[10px] uppercase text-slate-400">Employer Contact Channels:</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {job.contactEmail && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" /> {job.contactEmail}
                          </span>
                        )}
                        {job.contactPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {job.contactPhone}
                          </span>
                        )}
                        {job.contactLine && (
                          <span className="flex items-center gap-1 font-semibold text-emerald-700">
                            <MessageSquare className="w-3 h-3 text-emerald-600" /> LINE: {job.contactLine}
                          </span>
                        )}
                        {job.applicationLink && (
                          <a 
                            href={job.applicationLink} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary-600 font-bold hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" /> Career Portal
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Job Description Preview */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 bg-slate-50/60 p-3.5 rounded-2xl border border-slate-100">
                    {job.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0">
                  <button 
                    onClick={() => setSelectedJobId(job.id)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold text-sm py-3 rounded-2xl hover:from-primary-700 hover:to-indigo-700 shadow-md shadow-primary-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
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

      {/* ── Application Modal ─────────────────────────────────────────────── */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="px-7 py-5 bg-gradient-to-r from-slate-900 to-slate-950 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400">
                  Internship Application
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  Apply to {selectedJob.company.companyName}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedJobId(null)} 
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitApplication} className="p-7 space-y-4">
              {/* Job Highlights Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                <p className="font-extrabold text-sm text-slate-900">{selectedJob.title}</p>
                <div className="flex flex-wrap gap-2 text-slate-500">
                  <span>📍 {selectedJob.location}</span>
                  {selectedJob.allowance && <span>• 💰 {selectedJob.allowance}</span>}
                  {selectedJob.workingHours && <span>• ⏰ {selectedJob.workingHours}</span>}
                </div>
                {selectedJob.requirements && (
                  <p className="text-slate-600 pt-1 border-t border-slate-200/60">
                    <strong className="text-slate-800">Requirements:</strong> {selectedJob.requirements}
                  </p>
                )}
              </div>

              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
                  {modalError}
                </div>
              )}

              {modalSuccess ? (
                <div className="p-6 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                  <h4 className="text-base font-bold text-slate-900">Application Submitted!</h4>
                  <p className="text-xs text-slate-500">Good luck! Your application and CV have been forwarded to the employer.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Cover Letter / Message to HR (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Introduce yourself, explain your interest in this role, and highlight key projects..."
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                    ></textarea>
                  </div>

                  {/* Pin Point Attachments (Multi-File Upload & Links) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        📎 Attachments & Artifacts (CV, Resume, Portfolio, Links)
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-2.5 py-1 rounded-lg transition-colors">
                          <UploadCloud className="w-3.5 h-3.5" />
                          {uploadingFile ? 'Uploading...' : 'Upload File'}
                          <input 
                            type="file" 
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip" 
                            className="hidden" 
                            onChange={handleFileUpload} 
                            disabled={uploadingFile}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleAddAttachmentLink}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          + Add Link
                        </button>
                      </div>
                    </div>

                    {attachments.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
                        {attachments.map((link, idx) => {
                          const isFile = isFileAttachment(link);
                          return (
                            <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                              <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                                {isFile ? <FileText className="w-4 h-4 text-primary-600" /> : <ExternalLink className="w-4 h-4 text-indigo-600" />}
                              </span>
                              <input
                                type="text"
                                placeholder="Label / Document Name (e.g. CV_John.pdf, Portfolio)"
                                value={link.title}
                                onChange={(e) => handleAttachmentChange(idx, 'title', e.target.value)}
                                className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary-500 bg-white"
                              />
                              <input
                                type="text"
                                placeholder="URL (https://... or uploaded file path)"
                                value={link.url}
                                onChange={(e) => handleAttachmentChange(idx, 'url', e.target.value)}
                                className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary-500 bg-slate-50 font-mono text-[11px]"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Remove attachment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-primary-400 transition-colors bg-slate-50/50">
                        <label className="cursor-pointer flex flex-col items-center gap-1.5">
                          <UploadCloud className="w-7 h-7 text-slate-400" />
                          <span className="text-xs font-bold text-primary-600">
                            {uploadingFile ? 'Uploading file...' : 'Click to upload CV / Resume or add links'}
                          </span>
                          <span className="text-[10px] text-slate-400">PDF, Word docs, portfolios, GitHub, or Figma links</span>
                          <input 
                            type="file" 
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip" 
                            className="hidden" 
                            onChange={handleFileUpload} 
                            disabled={uploadingFile}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedJobId(null)}
                      className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:from-primary-700 hover:to-indigo-700 shadow-md shadow-primary-500/20 disabled:opacity-50"
                    >
                      {uploading ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
