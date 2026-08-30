import { useEffect, useState, useRef } from 'react';
import { 
  GraduationCap, 
  Globe, 
  MapPin, 
  Mail, 
  Phone, 
  Save, 
  Building,
  Camera
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export default function AdminProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [localLogoPreview, setLocalLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    universityName: '',
    domain: '',
    description: '',
    logoUrl: '',
    address: '',
    contactEmail: '',
    contactPhone: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.user?.name || '',
          universityName: data.university?.name || '',
          domain: data.university?.domain || '',
          description: data.university?.description || '',
          logoUrl: data.university?.logoUrl || data.user?.avatarUrl || '',
          address: data.university?.address || '',
          contactEmail: data.university?.contactEmail || '',
          contactPhone: data.university?.contactPhone || ''
        });
      }
    } catch (error) {
      console.error(error);
      showError('Failed to load university profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('Image file size must be less than 5MB');
      return;
    }

    // Instant local preview
    const previewUrl = URL.createObjectURL(file);
    setLocalLogoPreview(previewUrl);

    setUploadingLogo(true);
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('file', file);
      data.append('type', 'AVATAR');

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data
      });

      if (res.ok) {
        const result = await res.json();
        const uploadedUrl = result.fileUrl || result.url;
        setFormData(prev => ({ ...prev, logoUrl: uploadedUrl }));
        success('University emblem/logo uploaded! Click "Save Profile Changes" to apply.');
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to upload emblem');
      }
    } catch (error) {
      showError('Error uploading emblem');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        success('University profile updated successfully!');
        const localUser = localStorage.getItem('user');
        if (localUser) {
          const parsed = JSON.parse(localUser);
          parsed.name = formData.name;
          if (formData.logoUrl) parsed.avatarUrl = formData.logoUrl;
          localStorage.setItem('user', JSON.stringify(parsed));
        }
      } else {
        const err = await res.json();
        showError(err.error || 'Failed to update university profile');
      }
    } catch (error) {
      showError('Network error updating university profile');
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={logoInputRef} 
        onChange={handleLogoFileChange} 
        accept="image/png,image/jpeg,image/jpg,image/webp" 
        className="hidden" 
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
              Academic Institution Settings
            </span>
            <span className="text-xs font-semibold text-slate-500">
              University Portal
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            University Profile & Program Chair
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage university identity, academic domains, contact info, and official certificate signatures.
          </p>
        </div>
      </div>

      {/* ── Profile Form ────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-7 sm:p-9 space-y-6">
        {/* University Header Overview */}
        <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
          <div className="relative group">
            <div 
              onClick={() => logoInputRef.current?.click()}
              className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md border-2 border-slate-200 overflow-hidden flex items-center justify-center relative cursor-pointer hover:border-amber-300 transition-all"
            >
              {(localLogoPreview || formData.logoUrl) ? (
                <img 
                  src={(localLogoPreview || formData.logoUrl).startsWith('blob:') || (localLogoPreview || formData.logoUrl).startsWith('http') ? (localLogoPreview || formData.logoUrl) : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${(localLogoPreview || formData.logoUrl)}`} 
                  alt={formData.universityName} 
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-amber-500 to-primary-600 flex items-center justify-center text-white text-2xl font-black shadow-inner">
                  {formData.universityName ? formData.universityName.charAt(0) : 'U'}
                </div>
              )}

              {/* Hover Overlay */}
              {!uploadingLogo && (
                <div className="absolute inset-0 rounded-xl bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-center p-1">
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold">Change</span>
                </div>
              )}

              {/* Uploading Spinner */}
              {uploadingLogo && (
                <div className="absolute inset-0 rounded-xl bg-slate-950/70 flex flex-col items-center justify-center text-white">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mb-0.5"></div>
                  <span className="text-[8px] font-bold">Uploading...</span>
                </div>
              )}
            </div>

            {/* Corner Camera Button */}
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
              className="absolute -bottom-1 -right-1 bg-amber-600 hover:bg-amber-700 text-white p-1.5 rounded-xl shadow-md border-2 border-white cursor-pointer hover:scale-110 active:scale-95 transition-all z-10"
              title="Upload university emblem/logo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              {formData.universityName || 'Your University Name'}
            </h3>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Domain: {formData.domain || 'domain.edu'} • {formData.address || 'Campus Location'}
            </p>
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="mt-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
            >
              Upload Official Emblem
            </button>
          </div>
        </div>

        {/* Section 1: University Institution Info */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
            <Building className="w-4 h-4" />
            University Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                University Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Chulalongkorn University"
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500"
                value={formData.universityName}
                onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Domain *
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="chula.ac.th"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Campus Address / Faculty Office
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g., Faculty of Engineering, 254 Phayathai Road, Pathumwan, Bangkok"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Internship Program Overview & Requirements
            </label>
            <textarea
              rows={3}
              placeholder="Describe curriculum requirements (e.g., 400 mandatory hours, academic grading criteria)..."
              className="w-full border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-amber-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>
        </div>

        {/* Section 2: Program Chair / Faculty Advisor */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" />
            Faculty Advisor / Program Chair
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Advisor / Admin Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Dr. Somchai Prasert"
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Official Contact Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="admin@chula.ac.th"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Office Telephone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="02-218-6000"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-primary-600 text-white font-bold text-sm shadow-md shadow-amber-500/20 hover:from-amber-700 hover:to-primary-700 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Changes...' : 'Save University Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
