import { useEffect, useState } from 'react';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'COMPANY_HR' | 'UNIVERSITY_ADMIN';
}

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, {user.name}! 👋</h2>
        <p className="text-gray-600">
          You are logged in as a <span className="font-semibold text-primary-600">{user.role}</span>.
        </p>
      </div>

      {user.role === 'STUDENT' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Applications Sent" value="0" />
          <StatCard title="Interviews" value="0" />
          <StatCard title="Offers" value="0" />
        </div>
      )}

      {user.role === 'COMPANY_HR' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Active Jobs" value="0" />
          <StatCard title="Total Applicants" value="0" />
          <StatCard title="Interviews Scheduled" value="0" />
        </div>
      )}

      {user.role === 'UNIVERSITY_ADMIN' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Students" value="0" />
          <StatCard title="Placed Students" value="0" />
          <StatCard title="Pending Approvals" value="0" />
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
      <p className="mt-2 text-4xl font-extrabold text-gray-900">{value}</p>
    </div>
  );
}
