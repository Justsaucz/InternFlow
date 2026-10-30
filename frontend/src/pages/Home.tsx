import { useState } from 'react';
import { 
  ArrowRight, 
  Briefcase, 
  Sparkles, 
  ChevronDown,
  Search,
  MapPin,
  Clock,
  Coins,
  Code2,
  Palette,
  BarChart3,
  Megaphone,
  Layers,
  Check,
  Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage, LanguageSwitcher } from '../context/LanguageContext';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedWorkType, setSelectedWorkType] = useState('ALL');
  const [activeJobTab, setActiveJobTab] = useState<'ALL' | 'TECH' | 'DESIGN' | 'MARKETING' | 'REMOTE'>('ALL');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { t, language } = useLanguage();

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const isTh = language === 'th';

  // Job Categories Data
  const categories = [
    { 
      id: 'TECH', 
      name: isTh ? 'วิศวกรรมซอฟต์แวร์และเทคโนโลยี' : 'Software & Engineering', 
      icon: Code2, 
      count: isTh ? '180+ ตำแหน่ง' : '180+ Listings', 
      color: 'from-emerald-500 to-teal-600' 
    },
    { 
      id: 'DESIGN', 
      name: isTh ? 'การออกแบบผลิตภัณฑ์และ UI/UX' : 'UI/UX & Product Design', 
      icon: Palette, 
      count: isTh ? '95+ ตำแหน่ง' : '95+ Listings', 
      color: 'from-teal-500 to-cyan-600' 
    },
    { 
      id: 'DATA', 
      name: isTh ? 'วิทยาศาสตร์ข้อมูลและ GenAI' : 'Data Science & GenAI', 
      icon: BarChart3, 
      count: isTh ? '75+ ตำแหน่ง' : '75+ Listings', 
      color: 'from-emerald-600 to-green-700' 
    },
    { 
      id: 'MARKETING', 
      name: isTh ? 'การตลาดดิจิทัลและสื่อสร้างสรรค์' : 'Digital Growth & Media', 
      icon: Megaphone, 
      count: isTh ? '110+ ตำแหน่ง' : '110+ Listings', 
      color: 'from-green-500 to-emerald-600' 
    },
    { 
      id: 'PRODUCT', 
      name: isTh ? 'การจัดการผลิตภัณฑ์และโครงการ' : 'Product & Project Ops', 
      icon: Layers, 
      count: isTh ? '60+ ตำแหน่ง' : '60+ Listings', 
      color: 'from-teal-600 to-emerald-800' 
    },
    { 
      id: 'BUSINESS', 
      name: isTh ? 'ธุรกิจ การเงินและการลงทุน' : 'Business & Finance', 
      icon: Briefcase, 
      count: isTh ? '85+ ตำแหน่ง' : '85+ Listings', 
      color: 'from-emerald-700 to-teal-700' 
    },
  ];

  // Featured Internships
  const featuredJobs = [
    {
      id: 1,
      title: 'Frontend Engineer Intern (React / Next.js)',
      company: 'SCB 10X Venture Lab',
      category: 'TECH',
      logo: '10X',
      logoBg: 'bg-emerald-600',
      location: isTh ? 'กรุงเทพฯ (BTS เพลินจิต)' : 'Bangkok (BTS Phloen Chit)',
      type: isTh ? 'ผสมผสาน (เข้าออฟฟิศ 3 วัน)' : 'Hybrid (3d Office)',
      stipend: isTh ? '฿18,000 / เดือน' : '฿18,000 / mo',
      duration: isTh ? '4 - 6 เดือน' : '4 - 6 Months',
      tags: ['React', 'TypeScript', 'Tailwind', 'CWIE Ready'],
      featured: true,
      appliedCount: 24
    },
    {
      id: 2,
      title: 'Product Design Intern (Design Systems & UX)',
      company: 'Agoda Thailand',
      category: 'DESIGN',
      logo: 'AG',
      logoBg: 'bg-teal-600',
      location: isTh ? 'กรุงเทพฯ (เซ็นทรัลเวิลด์)' : 'Bangkok (Central World)',
      type: isTh ? 'ผสมผสาน (WFH 2 วัน)' : 'Hybrid (2d Remote)',
      stipend: isTh ? '฿20,000 / เดือน' : '฿20,000 / mo',
      duration: isTh ? '4 เดือน (สหกิจศึกษา)' : '4 Months (CWIE)',
      tags: ['Figma', 'User Research', 'Design Systems'],
      featured: true,
      appliedCount: 18
    },
    {
      id: 3,
      title: 'Data Analyst & Machine Learning Trainee',
      company: 'LINE MAN Wongnai',
      category: 'TECH',
      logo: 'LM',
      logoBg: 'bg-green-600',
      location: isTh ? 'กรุงเทพฯ (สีลม)' : 'Bangkok (Silom)',
      type: isTh ? 'เข้าสำนักงาน' : 'On-site',
      stipend: isTh ? '฿16,000 / เดือน' : '฿16,000 / mo',
      duration: isTh ? '16 สัปดาห์' : '16 Weeks',
      tags: ['Python', 'SQL', 'BigQuery', 'Tableau'],
      featured: false,
      appliedCount: 31
    },
    {
      id: 4,
      title: 'Digital Marketing & Content Creator Intern',
      company: 'Bitkub Capital Group',
      category: 'MARKETING',
      logo: 'BK',
      logoBg: 'bg-emerald-700',
      location: isTh ? 'กรุงเทพฯ (อโศก)' : 'Bangkok (Asok)',
      type: isTh ? 'ไฮบริด' : 'Hybrid',
      stipend: isTh ? '฿15,000 / เดือน' : '฿15,000 / mo',
      duration: isTh ? '4 เดือน' : '4 Months',
      tags: ['TikTok & Reels', 'SEO', 'Content Strategy'],
      featured: false,
      appliedCount: 15
    },
    {
      id: 5,
      title: 'Full-Stack Developer Intern (Node.js & Go)',
      company: 'True Digital Park Labs',
      category: 'TECH',
      logo: 'TD',
      logoBg: 'bg-teal-700',
      location: isTh ? 'กรุงเทพฯ (ปุณณวิถี)' : 'Bangkok (Punnawithi)',
      type: isTh ? 'ทำงานทางไกล' : 'Remote Allowed',
      stipend: isTh ? '฿18,000 / เดือน' : '฿18,000 / mo',
      duration: isTh ? '4 - 6 เดือน' : '4 - 6 Months',
      tags: ['Go', 'Node.js', 'PostgreSQL', 'Docker'],
      featured: true,
      appliedCount: 29
    },
    {
      id: 6,
      title: 'Junior UX Researcher & Usability Tester',
      company: 'KBTG (Kasikorn Tech)',
      category: 'DESIGN',
      logo: 'KB',
      logoBg: 'bg-emerald-800',
      location: isTh ? 'นนทบุรี (แจ้งวัฒนะ)' : 'Nonthaburi (Chaengwattana)',
      type: isTh ? 'ไฮบริด' : 'Hybrid',
      stipend: isTh ? '฿17,500 / เดือน' : '฿17,500 / mo',
      duration: isTh ? '16 สัปดาห์ (CWIE)' : '16 Weeks (CWIE)',
      tags: ['User Testing', 'Wireframing', 'Prototyping'],
      featured: false,
      appliedCount: 12
    }
  ];

  // Filter jobs based on active tab
  const filteredJobs = activeJobTab === 'ALL' 
    ? featuredJobs 
    : activeJobTab === 'REMOTE'
      ? featuredJobs.filter(j => j.type.toLowerCase().includes('remote') || j.type.toLowerCase().includes('hybrid') || j.type.includes('ไกล') || j.type.includes('ผสม'))
      : featuredJobs.filter(j => j.category === activeJobTab);

  const faqs = isTh ? [
    {
      q: "ขั้นตอนการสมัครและระบบตรวจสอบทำงานอย่างไร?",
      a: "นักศึกษาสร้างโปรไฟล์ฟรี อัปโหลดใบทรานสคริปต์มหาวิทยาลัย และเลือกตำแหน่งงานที่สนใจ ระบบจะดึงเกรดเฉลี่ยและวิชาที่เรียนอย่างโปร่งใส พร้อมจับคู่กับสถานประกอบการที่ต้องการทักษะตรงกัน เมื่อได้รับการตอบรับ ที่ฝึกงานของคุณจะได้รับการการันตี 100% ไม่มีปัญหาการยกเลิกกระทันหัน"
    },
    {
      q: "InternFlow ใช้งานได้ฟรีสำหรับนักศึกษาหรือไม่?",
      a: "ฟรี 100%! สำหรับนักศึกษาทุกคน คุณสามารถค้นหาตำแหน่งงาน ส่งใบสมัคร บันทึก Logbook มากกว่า 400 ชั่วโมง และรับรายงานประเมินผลตามเกณฑ์ CWIE ได้โดยไม่มีค่าใช้จ่ายใดๆ"
    },
    {
      q: "กฎการยืนยันสิทธิ์เพียงแห่งเดียว (Single-Commitment) คืออะไร?",
      a: "เมื่อนักศึกษายืนยันรับข้อเสนอฝึกงานจากบริษัทใดแล้ว ระบบจะยกเลิกใบสมัครอื่นๆ ให้อัตโนมัติ เพื่อสร้างความมั่นใจแก่สถานประกอบการว่านักศึกษาจะไปปฏิบัติงานจริง และการันตีว่าสถานประกอบการจะไม่ยกเลิกสิทธิ์ของนักศึกษาเช่นกัน"
    },
    {
      q: "พี่เลี้ยงสถานประกอบการตรวจและรับรอง Logbook อย่างไร?",
      a: "แทนที่จะต้องตรวจสมุดบันทึกเล่มหนาช่วงปลายเทอม พี่เลี้ยงสามารถใช้ระบบตรวจรายสัปดาห์ในคลิกเดียว ตรวจสอบงานที่ส่งจริง และระบบจะคำนวณชั่วโมงพร้อมสรุปแบบประเมินให้อัตโนมัติ"
    }
  ] : [
    {
      q: "How does the application and verification process work?",
      a: "Students create a free profile, upload their university transcript, and browse curated internships. Our engine extracts verified GPAs and courses directly, matching you with employers seeking your exact academic background. Once offered, your placement is guaranteed with zero start-day ghosting."
    },
    {
      q: "Is InternFlow completely free for students?",
      a: "Yes! InternFlow is 100% free for all students. You can search positions, submit applications, track your 400+ hour logbooks, and receive university-accredited CWIE graduation rubrics at zero cost."
    },
    {
      q: "What is the Single-Commitment Protocol?",
      a: "When a student confirms an internship offer on InternFlow, competing pending applications are automatically declined and new applications are locked. This guarantees to employers that the student will report on start day, and guarantees to the student that their seat cannot be revoked."
    },
    {
      q: "How do mentors track and sign off on university logbooks?",
      a: "Instead of dealing with thick paper binders at week 16, mentors use our Daily Logbook Inspector Drawer. Mentors approve logged tasks in 1 click, which automatically compiles compliant CWIE rubrics and certificates."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white font-sans antialiased">
      {/* ── Sticky Top Navigation ────────────────────────────── */}
      <nav className="fixed w-full z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform text-white font-black text-lg">
                IF
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-slate-900 font-heading">
                  Intern<span className="text-emerald-600">Flow</span>
                </span>
                <span className="hidden sm:inline-block ml-2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  CWIE Certified
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#search" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">{t.home.findInternships}</a>
              <a href="#categories" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">{t.home.categories}</a>
              <a href="#featured" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">{t.home.featuredJobs}</a>
              <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">{t.home.howItWorks}</a>
              <a href="#faq" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">{t.home.faq}</a>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link 
                to="/login" 
                className="text-sm font-semibold text-slate-700 hover:text-emerald-600 px-4 py-2 rounded-xl transition-colors"
              >
                {t.home.signIn}
              </Link>
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-700 hover:to-teal-700 shadow-md hover:shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {t.home.getStarted}
                <ArrowRight className="ml-1.5 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero Section (Student-Centric Job Portal) ────────── */}
      <section id="search" className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden bg-gradient-to-b from-emerald-50/50 via-slate-50 to-slate-50">
        {/* Glow Spheres */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-20 left-1/4 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl" />
          <div className="absolute -top-10 right-1/4 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-10">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold shadow-xs mb-6">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{t.home.heroBadge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-6 font-heading">
              {t.home.heroTitle1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">{t.home.heroTitle2}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {t.home.heroSubtitle}
            </p>
          </div>

          {/* ── Main Interactive Search Box ───────────────────── */}
          <div className="max-w-4xl mx-auto bg-white p-3 sm:p-4 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Field 1: Keyword */}
              <div className="md:col-span-5 relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t.home.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 text-sm font-medium bg-slate-50 md:bg-transparent border md:border-none border-slate-200 rounded-2xl md:rounded-none focus:outline-none focus:ring-2 md:focus:ring-0 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Divider on desktop */}
              <div className="hidden md:block w-px h-8 bg-slate-200 mx-auto" />

              {/* Field 2: Category Selector */}
              <div className="md:col-span-3 relative flex items-center">
                <Compass className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-12 pr-8 py-3.5 text-sm font-medium bg-slate-50 md:bg-transparent border md:border-none border-slate-200 rounded-2xl md:rounded-none focus:outline-none focus:ring-2 md:focus:ring-0 focus:ring-emerald-500 text-slate-700 appearance-none cursor-pointer"
                >
                  <option value="ALL">{isTh ? 'ทุกหมวดหมู่' : 'All Categories'}</option>
                  <option value="TECH">{isTh ? 'ซอฟต์แวร์และเทค' : 'Software & Tech'}</option>
                  <option value="DESIGN">{isTh ? 'ดีไซน์และ UX/UI' : 'Product & UI/UX'}</option>
                  <option value="DATA">{isTh ? 'ข้อมูลและ AI' : 'Data & AI'}</option>
                  <option value="MARKETING">{isTh ? 'การตลาดดิจิทัล' : 'Digital Growth'}</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 pointer-events-none" />
              </div>

              {/* Divider on desktop */}
              <div className="hidden md:block w-px h-8 bg-slate-200 mx-auto" />

              {/* Field 3: Location / Work Type */}
              <div className="md:col-span-2 relative flex items-center">
                <MapPin className="w-5 h-5 text-slate-400 absolute left-3 pointer-events-none" />
                <select
                  value={selectedWorkType}
                  onChange={(e) => setSelectedWorkType(e.target.value)}
                  className="w-full pl-10 pr-6 py-3.5 text-sm font-medium bg-slate-50 md:bg-transparent border md:border-none border-slate-200 rounded-2xl md:rounded-none focus:outline-none focus:ring-2 md:focus:ring-0 focus:ring-emerald-500 text-slate-700 appearance-none cursor-pointer"
                >
                  <option value="ALL">{isTh ? 'ทุกสถานที่' : 'All Locations'}</option>
                  <option value="BANGKOK">{isTh ? 'กรุงเทพฯ' : 'Bangkok'}</option>
                  <option value="HYBRID">{isTh ? 'แบบผสมผสาน' : 'Hybrid'}</option>
                  <option value="REMOTE">{isTh ? 'ทำงานทางไกล' : 'Remote'}</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 pointer-events-none" />
              </div>

              {/* Search Button */}
              <div className="md:col-span-2">
                <Link
                  to="/register"
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t.home.searchBtn}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{t.home.trending}</span>
            {['#Frontend', '#DataScience', '#UXUI', '#ProductOps', '#CWIE-480Hrs', '#Bangkok-BTS'].map(tag => (
              <button 
                key={tag}
                onClick={() => setSearchQuery(tag.replace('#', ''))}
                className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Key Metric Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-14 pt-8 border-t border-slate-200/80">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-heading">500+</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{isTh ? 'ตำแหน่งงานที่รับรองแล้ว' : 'Verified Listings'}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-600 font-heading">฿15k - ฿22k</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{isTh ? 'เบี้ยเลี้ยงเฉลี่ย / เดือน' : 'Avg. Monthly Stipend'}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-heading">0% Ghosting</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{isTh ? 'กฎข้อเสนอมีผลผูกพัน' : 'Single-Commitment Rule'}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-heading">16 Weeks</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{isTh ? 'เกณฑ์ตามมาตรฐาน CWIE' : 'CWIE Compliant Rubrics'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular Job Categories Section ──────────────────── */}
      <section id="categories" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
                {isTh ? 'สายงานยอดนิยม' : 'Top Fields'}
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-heading">
                {t.home.browseByCategory}
              </h2>
              <p className="text-slate-600 mt-2 text-base">
                {t.home.browseSubtitle}
              </p>
            </div>
            <Link 
              to="/register" 
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              {t.home.viewAllJobs}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div 
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    const el = document.getElementById('search');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group relative p-6 rounded-3xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors font-heading">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {cat.count}
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white group-hover:bg-emerald-50 border border-slate-200 group-hover:border-emerald-200 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-all">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured Internships Grid ────────────────────────── */}
      <section id="featured" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
                {isTh ? 'เปิดรับสมัครตรง' : 'Handpicked Openings'}
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-heading">
                {t.home.featuredTitle}
              </h2>
              <p className="text-slate-600 mt-2 text-base">
                {t.home.featuredSubtitle}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mt-6 md:mt-0 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              {(['ALL', 'TECH', 'DESIGN', 'MARKETING', 'REMOTE'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveJobTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeJobTab === tab 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'ALL' ? (isTh ? 'ทั้งหมด' : 'All') :
                   tab === 'TECH' ? (isTh ? 'เทคโนโลยี' : 'Tech') :
                   tab === 'DESIGN' ? (isTh ? 'การออกแบบ' : 'Design') :
                   tab === 'MARKETING' ? (isTh ? 'การตลาด' : 'Marketing') : (isTh ? 'ทำงานทางไกล' : 'Remote')}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map(job => (
              <div 
                key={job.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${job.logoBg} flex items-center justify-center text-white font-extrabold text-sm shadow-md`}>
                        {job.logo}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {job.company}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location}
                        </div>
                      </div>
                    </div>

                    {job.featured && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Hot
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-extrabold text-slate-900 mb-3 leading-snug font-heading group-hover:text-emerald-800 transition-colors">
                    {job.title}
                  </h3>

                  {/* Meta Specs */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
                      <Coins className="w-3.5 h-3.5 text-emerald-600" />
                      {job.stipend}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {job.type}
                    </div>
                  </div>

                  {/* Skill Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {job.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-800 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {job.appliedCount} {isTh ? 'ผู้สมัคร' : 'applicants'}
                  </span>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition-all shadow-xs"
                  >
                    {t.home.applyNow}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* View More CTA */}
          <div className="text-center mt-12">
            <Link 
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md hover:shadow-lg transition-all"
            >
              {t.home.viewAllJobs}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works (3 Steps for Students) ─────────────── */}
      <section id="how-it-works" className="py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
              {isTh ? 'ขั้นตอนที่ราบรื่น' : 'Frictionless Journey'}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-heading">
              {t.home.howTitle}
            </h2>
            <p className="text-slate-600 mt-2 text-base">
              {t.home.howSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center mb-6 shadow-md shadow-emerald-600/20 font-heading">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-heading">
                {t.home.step1Title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.home.step1Desc}
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 relative">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-extrabold text-xl flex items-center justify-center mb-6 shadow-md shadow-teal-600/20 font-heading">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-heading">
                {t.home.step2Title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.home.step2Desc}
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white font-extrabold text-xl flex items-center justify-center mb-6 shadow-md shadow-emerald-800/20 font-heading">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-heading">
                {t.home.step3Title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.home.step3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hiring Partner Callout (For Employers) ───────────── */}
      <section className="py-20 bg-gradient-to-br from-[#062314] via-[#0a3820] to-[#04190e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
                {isTh ? 'สำหรับสถานประกอบการและ HR' : 'For Employers & Recruiters'}
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4 font-heading">
                {isTh ? 'เบื่อไหมกับเรซูเมที่ไม่ตรงปก และผู้สมัครสละสิทธิ์กระทันหัน?' : 'Tired of Unverified Resumes and Candidate Ghosting?'}
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mb-6">
                {isTh ? 'เปิดรับสมัครตำแหน่งฝึกงานได้ใน 2 นาที รับผู้สมัครที่ผ่านการคัดกรองคุณสมบัติจริง พร้อมระบบตอบรับข้อเสนอที่มีผลผูกพันและการตรวจ Logbook ใน 1 คลิก' : 'Post your openings in 2 minutes. Receive pre-screened candidates matching your exact criteria with binding offer commitments and 1-click mentor oversight.'}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-emerald-300 font-semibold">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{isTh ? 'คัดกรองไวกว่าเดิม 80%' : '80% Faster Screening'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{isTh ? 'ไม่มีการสละสิทธิ์วันแรก' : 'Zero Day-One No-Shows'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{isTh ? 'รองรับมาตรฐาน CWIE 16 สัปดาห์' : 'CWIE 16-Week Ready'}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 text-left lg:text-right">
              <Link 
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all"
              >
                {isTh ? 'ลงประกาศรับสมัครงาน' : 'Post an Internship'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ─────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
              {t.home.faq}
            </h2>
            <p className="text-slate-600 mt-2 text-base">
              {isTh ? 'ตอบทุกข้อสงสัยเกี่ยวกับการใช้งานแพลตฟอร์ม InternFlow' : 'Everything you need to know about the InternFlow platform.'}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="text-base font-bold text-slate-900 font-heading">
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === index ? 'rotate-180 text-emerald-600' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modern Footer ───────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-sm">
                IF
              </div>
              <span className="text-xl font-black text-slate-900 font-heading">
                Intern<span className="text-emerald-600">Flow</span>
              </span>
              <span className="text-xs text-slate-400 ml-2">
                © {new Date().getFullYear()} InternFlow Platform. All rights reserved.
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-600">
              <Link to="/register" className="hover:text-emerald-600 transition-colors">{t.home.findInternships}</Link>
              <Link to="/login" className="hover:text-emerald-600 transition-colors">{t.home.signIn}</Link>
              <a href="https://cwie.mhesi.go.th" target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                MHESI CWIE Framework &rarr;
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
