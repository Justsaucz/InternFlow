import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface University {
  id: string;
  name: string;
  domain: string;
}

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [universityId, setUniversityId] = useState('');
  const [universities, setUniversities] = useState<University[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/universities`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUniversities(data);
      })
      .catch(err => console.error('Failed to load universities:', err));
  }, []);

  const showUniversityField = role === 'STUDENT' || role === 'UNIVERSITY_ADMIN';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        email,
        password,
        name,
        role,
        ...(showUniversityField && universityId ? { universityId } : {})
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(data.error || 'Registration failed. Please check your information.');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="inline-flex w-12 h-12 bg-primary-600 rounded-2xl items-center justify-center text-white shadow-lg shadow-primary-500/20 mb-4">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create an Account</h2>
          <p className="mt-2 text-sm text-gray-500">Join the multi-university internship network</p>
        </div>

        {error && (
          <div className="flex items-center p-4 text-sm text-red-800 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 mr-2.5 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center p-4 text-sm text-emerald-800 rounded-xl bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5 mr-2.5 flex-shrink-0 text-emerald-600" />
            <span>Registration successful! Redirecting to login...</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              required
              className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
            <select
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all bg-white"
              value={role}
              onChange={(e) => { setRole(e.target.value); setUniversityId(''); }}
            >
              <option value="STUDENT">Student (Internship seeker)</option>
              <option value="COMPANY_HR">Company HR (Recruiter)</option>
              <option value="UNIVERSITY_ADMIN">University Administrator</option>
            </select>
          </div>

          {showUniversityField && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                University {role === 'STUDENT' ? '(Optional)' : ''}
              </label>
              <select
                className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all bg-white"
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                required={role === 'UNIVERSITY_ADMIN'}
              >
                <option value="">-- Select University --</option>
                {universities.map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.name}
                  </option>
                ))}
              </select>
              {universities.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">No universities available yet.</p>
              )}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || success}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600 pt-2 border-t border-gray-100">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
