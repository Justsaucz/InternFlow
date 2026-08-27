import { useState } from 'react';
import { 
  ArrowRight, 
  Briefcase, 
  Building2, 
  GraduationCap, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'student' | 'company' | 'university'>('student');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How does the University Approval workflow work?",
      a: "When a student accepts an internship offer from an employer, the application automatically flows to their University Administrator's dashboard for official verification and academic credit clearance in just 1 click."
    },
    {
      q: "Is InternFlow free for university students?",
      a: "Yes! InternFlow is 100% free for students to build profiles, discover opportunities, submit applications, and track progress throughout their academic journey."
    },
    {
      q: "How do partner companies verify applicant credentials?",
      a: "All student profiles are directly tethered to accredited universities in the network. Recruiters see verified GPAs, faculties, majors, and official faculty clearances right inside their applicant pipeline."
    },
    {
      q: "What security measures protect student data?",
      a: "InternFlow employs role-based access control (RBAC), end-to-end encrypted sessions, and compliant cloud storage for CVs and institutional documents."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-primary-500 selection:text-white font-sans antialiased">
      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <nav className="fixed w-full z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 bg-gradient-to-tr from-primary-600 via-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
                  Intern<span className="text-primary-600">Flow</span>
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary-50 text-primary-700 rounded-full border border-primary-200">
                  v1.0 Live
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors">How It Works</a>
              <a href="#roles" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors">For You</a>
              <a href="#faq" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors">FAQ</a>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="text-sm font-semibold text-slate-700 hover:text-primary-600 px-4 py-2 rounded-xl transition-colors"
              >
                Log In
              </Link>
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-indigo-600 rounded-xl hover:from-primary-700 hover:to-indigo-700 shadow-md hover:shadow-lg shadow-primary-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Get Started
                <ArrowRight className="ml-1.5 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-36 overflow-hidden">
        {/* Background Glowing Mesh */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-20 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sky-300/15 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-primary-100 text-primary-800 text-xs sm:text-sm font-semibold shadow-sm mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-ping"></span>
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span>Multi-University Internship & Career Ecosystem</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-6">
              Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-sky-600 to-indigo-600">Students</span>, Connecting <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-primary-600">Companies</span>, Certified by Universities.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              The unified cloud platform bridging academic institutions, ambitious students, and top hiring partners with transparent 3-way application workflows.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link 
                to="/register" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl hover:from-primary-700 hover:to-indigo-700 shadow-xl shadow-primary-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all group"
              >
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-700 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
              >
                Explore Dashboard
              </Link>
            </div>

            {/* Key Trust Numbers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-6 border-t border-slate-200/80">
              <div className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-xs">
                <p className="text-2xl sm:text-3xl font-black text-primary-600">100%</p>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Verified Universities</p>
              </div>
              <div className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-xs">
                <p className="text-2xl sm:text-3xl font-black text-indigo-600">24 Hrs</p>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Avg. Approval Speed</p>
              </div>
              <div className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-xs">
                <p className="text-2xl sm:text-3xl font-black text-sky-600">3-Tier</p>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Integrated RBAC</p>
              </div>
              <div className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-xs">
                <p className="text-2xl sm:text-3xl font-black text-emerald-600">Secure</p>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Cloud Architecture</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Platform Preview Card ───────────────────────────────── */}
      <section className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-4 sm:p-8 rounded-3xl shadow-2xl border border-slate-800 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Window Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-slate-400 font-mono ml-2">internflow.workspace / live-preview</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Pipeline Active
            </span>
          </div>

          {/* Preview Mockup Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1: Job Feed */}
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-400 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" /> Open Listing
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-300 font-medium">
                    15,000 THB/mo
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">Frontend Engineering Intern</h4>
                <p className="text-xs text-slate-400 mb-3">Tech Innovators Corp • Bangkok / Hybrid</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300">React</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300">TypeScript</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300">Tailwind</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                <span>3 Positions Left</span>
                <span className="text-primary-400 font-semibold flex items-center gap-1">1-Click Apply <ArrowRight className="w-3 h-3" /></span>
              </div>
            </div>

            {/* Card 2: Student Pipeline Status */}
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Application Stage
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-medium">
                    98% Match
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">Somchai Prasert</h4>
                <p className="text-xs text-slate-400 mb-3">Computer Science • Year 3 • GPA 3.75</p>
                
                {/* Visual Pipeline Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span>Applied</span>
                    <span>HR Review</span>
                    <span className="text-emerald-400 font-bold">Approved</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden flex">
                    <div className="h-full bg-primary-500 w-1/3"></div>
                    <div className="h-full bg-indigo-500 w-1/3"></div>
                    <div className="h-full bg-emerald-500 w-1/3"></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Status</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Endorsed by Dean
                </span>
              </div>
            </div>

            {/* Card 3: University Admin Oversight */}
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin Control
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 font-medium">
                    Auto-Sync
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">Faculty of Engineering</h4>
                <p className="text-xs text-slate-400 mb-3">48 Active Cohort Placements</p>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/40 text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between"><span>Pending Approvals:</span><strong className="text-amber-400">2</strong></div>
                  <div className="flex justify-between"><span>Active Interns:</span><strong className="text-emerald-400">46</strong></div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                <span>Direct MoU Verification</span>
                <span className="text-emerald-400 font-semibold">100% Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tailored Roles (3-Tab Pillar Section) ─────────────────────────────── */}
      <section id="roles" className="py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
              One Platform, Three Ecosystems
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
              Designed specifically for your workflow
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-3">
              Whether you are seeking your first internship, recruiting the next generation of engineers, or coordinating university cohorts.
            </p>

            {/* Tab Switches */}
            <div className="flex items-center justify-center gap-2 mt-8 p-1.5 bg-slate-100 rounded-2xl max-w-md mx-auto">
              <button
                onClick={() => setActiveTab('student')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'student' 
                    ? 'bg-white text-primary-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                For Students
              </button>
              <button
                onClick={() => setActiveTab('company')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'company' 
                    ? 'bg-white text-primary-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                For Companies
              </button>
              <button
                onClick={() => setActiveTab('university')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'university' 
                    ? 'bg-white text-primary-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                For Universities
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="bg-slate-50 p-8 sm:p-12 rounded-3xl border border-slate-200">
            {activeTab === 'student' && (
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Fast-track your dream career with certified applications
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Build a standout profile with verified academic credentials. Browse pre-approved internship posts, apply with your resume in seconds, and track every stage transparently.
                  </p>
                  <ul className="space-y-3.5">
                    <li className="flex items-center text-sm font-medium text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      Automatic university alignment & GPA validation
                    </li>
                    <li className="flex items-center text-sm font-medium text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      Real-time push updates on HR review, interview calls, and offers
                    </li>
                    <li className="flex items-center text-sm font-medium text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      Direct academic credit clearance by faculty advisor
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link to="/register" className="inline-flex items-center text-sm font-bold text-primary-600 hover:text-primary-700">
                      Join as a Student <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-900">Student Portal Preview</span>
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">Active Account</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">Frontend Intern Application</h5>
                      <p className="text-xs text-slate-500 mt-0.5">Applied to TechCorp • Bangkok</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      Accepted
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">Data Analytics Intern</h5>
                      <p className="text-xs text-slate-500 mt-0.5">Applied to DataHub • Remote</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800">
                      In Review
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'company' && (
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Hire top campus talent directly from leading universities
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Post verified internship roles, filter students by major, GPA, and skill tags, and streamline hiring decisions without messy email attachments or lost resumes.
                  </p>
                  <ul className="space-y-3.5">
                    <li className="flex items-center text-sm font-medium text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      Unified applicant pipeline with CV preview and status updates
                    </li>
                    <li className="flex items-center text-sm font-medium text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      Instant offer dispatch and automatic university clearance trigger
                    </li>
                    <li className="flex items-center text-sm font-medium text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      Customizable job requirements, allowances, and hybrid options
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link to="/register" className="inline-flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-700">
                      Join as Employer / HR <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-900">Recruiter Pipeline</span>
                    <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">3 Active Listings</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-900">Software Engineer Intern</span>
                        <p className="text-[11px] text-slate-500">12 Applicants • 2 Shortlisted</p>
                      </div>
                      <span className="text-xs font-bold text-primary-600">Review (2)</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-900">UX/UI Design Intern</span>
                        <p className="text-[11px] text-slate-500">8 Applicants • 1 Accepted</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">Offer Sent</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'university' && (
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Complete oversight and official academic approvals
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Monitor student internship placements across all faculties in real-time. Provide official digital approvals and export compliance records in one click.
                  </p>
                  <ul className="space-y-3.5">
                    <li className="flex items-center text-sm font-medium text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      Comprehensive student directory and cohort tracking
                    </li>
                    <li className="flex items-center text-sm font-medium text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      1-Click official institutional endorsement for accepted offers
                    </li>
                    <li className="flex items-center text-sm font-medium text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      Automated statistics on placement rates and partner companies
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link to="/register" className="inline-flex items-center text-sm font-bold text-amber-600 hover:text-amber-700">
                      Join as University Admin <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-900">University Admin Center</span>
                    <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">Dean's Office</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
                      <span className="text-lg font-bold text-slate-900">120</span>
                      <p className="text-[11px] text-slate-500">Students Enrolled</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
                      <span className="text-lg font-bold text-emerald-600">92%</span>
                      <p className="text-[11px] text-slate-500">Placed in Q1</p>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between text-xs">
                    <span className="text-amber-800 font-medium">Pending Approvals: 3 Candidates</span>
                    <span className="font-bold text-amber-700">Review Now</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── How It Works (4-Step Roadmap) ───────────────────────────────────── */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
            Streamlined Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
            How InternFlow Connects the Loop in 4 Steps
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm relative group hover:shadow-xl hover:-translate-y-1 transition-all">
            <span className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-700 font-black text-base flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors">
              01
            </span>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Create Profile</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Register as a student with your verified university, or as an HR recruiter with your corporate domain.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm relative group hover:shadow-xl hover:-translate-y-1 transition-all">
            <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 font-black text-base flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              02
            </span>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Discover & Apply</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Browse curated internships matching your skills, upload resumes, and submit applications with 1-click.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm relative group hover:shadow-xl hover:-translate-y-1 transition-all">
            <span className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 font-black text-base flex items-center justify-center mb-6 group-hover:bg-sky-600 group-hover:text-white transition-colors">
              03
            </span>
            <h4 className="text-lg font-bold text-slate-900 mb-2">HR Interview & Offer</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Company recruiters review verified credentials and accept qualified candidates directly on the platform.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm relative group hover:shadow-xl hover:-translate-y-1 transition-all">
            <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-base flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              04
            </span>
            <h4 className="text-lg font-bold text-slate-900 mb-2">University Endorsement</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              University administrators review accepted offers and grant official academic credit approval instantly.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ Accordion Section ───────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-slate-50/50"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-primary-600 transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${openFaq === index ? 'rotate-180 text-primary-600' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call to Action Banner ───────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-primary-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" /> Start Your Journey Today
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6 leading-tight">
            Ready to streamline your university internship journey?
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join students, company recruiters, and faculty leaders already collaborating seamlessly on InternFlow.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register" 
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-900 bg-white rounded-2xl hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] shadow-2xl transition-all"
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-slate-800/80 border border-slate-700 rounded-2xl hover:bg-slate-800 transition-all"
            >
              Sign In to Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-md">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-slate-900">InternFlow</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
              <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-primary-600 transition-colors">How It Works</a>
              <a href="#roles" className="hover:text-primary-600 transition-colors">Ecosystem</a>
              <a href="#faq" className="hover:text-primary-600 transition-colors">FAQ</a>
              <Link to="/login" className="hover:text-primary-600 transition-colors">Log In</Link>
              <Link to="/register" className="hover:text-primary-600 transition-colors">Sign Up</Link>
            </div>

            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} InternFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
