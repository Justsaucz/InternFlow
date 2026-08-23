import { useEffect, useState } from 'react';
import { Book, Award } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

interface StudentProfile {
  id: string;
  studentId: string;
  major: string;
  faculty: string;
  year: number;
  gpa: number | null;
  skills: string[];
  bio: string | null;
  user: { name: string; email: string };
  university: { name: string };
}

export default function StudentProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    studentId: '',
    major: '',
    faculty: '',
    year: 1,
    gpa: '',
    bio: '',
    skills: '' // comma separated
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const profileRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/student/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data);
        setFormData({
          studentId: data.studentId || '',
          major: data.major || '',
          faculty: data.faculty || '',
          year: data.year || 1,
          gpa: data.gpa ? data.gpa.toString() : '',
          bio: data.bio || '',
          skills: data.skills ? data.skills.join(', ') : ''
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        year: parseInt(formData.year.toString()),
        gpa: formData.gpa ? parseFloat(formData.gpa) : null,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/student/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        success('Profile updated successfully!');
        setEditing(false);
        fetchProfile();
      } else {
        showError('Failed to update profile. Please try again.');
      }
    } catch (error) {
      showError('Network error. Please try again.');
      console.error(error);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        {!editing && (
          <button onClick={() => setEditing(true)} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Edit Profile
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-primary-600 h-32"></div>
        <div className="px-8 pb-8 relative">
          <div className="absolute -top-12 w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-md text-3xl font-bold text-primary-600">
            {profile.user.name.charAt(0)}
          </div>
          
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900">{profile.user.name}</h3>
            <p className="text-gray-500">{profile.user.email}</p>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6 border-t border-gray-100 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student ID</label>
                  <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">University</label>
                  <input type="text" className="mt-1 block w-full border border-gray-200 bg-gray-50 rounded-md shadow-sm py-2 px-3 text-gray-500 cursor-not-allowed" value={profile.university.name} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Faculty</label>
                  <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" value={formData.faculty} onChange={e => setFormData({...formData, faculty: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Major</label>
                  <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <input type="number" min="1" max="6" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">GPA</label>
                  <input type="number" step="0.01" max="4.00" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" value={formData.gpa} onChange={e => setFormData({...formData, gpa: e.target.value})} />
                </div>
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
                  <input type="text" placeholder="e.g. React, Node.js, Python" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} />
                </div>
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}></textarea>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setEditing(false)} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Save Changes</button>
              </div>
            </form>
          ) : (
            <div className="mt-8 border-t border-gray-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="flex items-center text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                    <Book className="w-4 h-4 mr-2 text-primary-500" /> Academic Info
                  </h4>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between"><dt className="text-gray-500">University</dt><dd className="font-medium text-gray-900">{profile.university.name}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Student ID</dt><dd className="font-medium text-gray-900">{profile.studentId || '-'}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Faculty</dt><dd className="font-medium text-gray-900">{profile.faculty || '-'}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Major</dt><dd className="font-medium text-gray-900">{profile.major || '-'}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Year</dt><dd className="font-medium text-gray-900">{profile.year || '-'}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">GPA</dt><dd className="font-medium text-gray-900">{profile.gpa || '-'}</dd></div>
                  </dl>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="flex items-center text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                    <Award className="w-4 h-4 mr-2 text-primary-500" /> Skills & Bio
                  </h4>
                  {profile.bio ? <p className="text-gray-600 text-sm mb-4">{profile.bio}</p> : <p className="text-gray-400 text-sm italic mb-4">No bio added yet.</p>}
                  
                  <div className="flex flex-wrap gap-2">
                    {profile.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm italic">No skills added yet.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
