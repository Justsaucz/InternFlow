import { ArrowRight, Briefcase, Building, GraduationCap, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-white selection:bg-primary-100 selection:text-primary-900">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                InternFlow
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">How it works</a>
              <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                <Link to="/login" className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors">Log in</Link>
                <Link to="/register" className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-full hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all shadow-md">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[50rem] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-50 via-white to-white -z-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 text-primary-700 font-medium text-sm mb-8 ring-1 ring-inset ring-primary-500/20 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <span className="flex h-2 w-2 rounded-full bg-primary-500 mr-2 animate-pulse"></span>
              The modern way to manage university internships
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 max-w-4xl mx-auto leading-tight animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">
              Connecting <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Students</span> to their Dream Careers
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
              A seamless platform bridging the gap between universities, students, and top companies. Find, apply, and approve internships effortlessly.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300">
              <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-primary-600 rounded-full hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/20 transition-all group">
                Start your journey 
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-gray-700 bg-white border-2 border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-50 transition-all">
                Login to Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Built for everyone in the loop</h2>
              <p className="mt-4 text-lg text-gray-600">Tailored experiences for students, HR, and university admins.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">For Students</h3>
                <p className="text-gray-600 mb-6">Create your profile, discover curated opportunities, apply with one click, and track your application status in real-time.</p>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm text-gray-700"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Resume Uploads</li>
                  <li className="flex items-center text-sm text-gray-700"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Application Tracking</li>
                </ul>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Building className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">For Companies</h3>
                <p className="text-gray-600 mb-6">Post jobs, review student profiles, download CVs, and manage your hiring pipeline directly from a unified dashboard.</p>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm text-gray-700"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Job Posting</li>
                  <li className="flex items-center text-sm text-gray-700"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Applicant Review</li>
                </ul>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">For Universities</h3>
                <p className="text-gray-600 mb-6">Monitor your students' progress, view their accepted offers, and provide final university approval all in one place.</p>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm text-gray-700"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Student Directory</li>
                  <li className="flex items-center text-sm text-gray-700"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Official Approvals</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gray-900"></div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-500 rounded-full blur-3xl opacity-20"></div>
          
          <div className="max-w-4xl mx-auto px-4 relative text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to streamline your internship process?</h2>
            <p className="text-gray-300 text-lg mb-10">Join thousands of students and leading companies already using InternFlow.</p>
            <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-gray-900 bg-white rounded-full hover:scale-105 transition-transform shadow-2xl">
              Create an Account Now
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900">InternFlow</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} InternFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
