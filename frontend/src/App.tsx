import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import JobSearch from './pages/student/JobSearch';
import JobManagement from './pages/company/JobManagement';
import StudentProfile from './pages/student/StudentProfile';
import MyApplications from './pages/student/MyApplications';
import CompanyApplicants from './pages/company/CompanyApplicants';
import AdminStudents from './pages/admin/AdminStudents';
import AdminApprovals from './pages/admin/AdminApprovals';

import Home from './pages/Home';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard Routes with Sidebar */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            
            {/* Student Routes */}
            <Route path="jobs" element={<JobSearch />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="profile" element={<StudentProfile />} />
            
            {/* Company Routes */}
            <Route path="jobs/manage" element={<JobManagement />} />
            <Route path="applicants" element={<CompanyApplicants />} />

            {/* Admin Routes */}
            <Route path="students" element={<AdminStudents />} />
            <Route path="approvals" element={<AdminApprovals />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;

