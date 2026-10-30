# 🎓💼 InternFlow — Internship & CWIE Management Platform

A modern, cloud-native web platform connecting university students and corporate employers into a single standardized workflow for discovering, applying, tracking, logging, and evaluating Cooperative and Work-Integrated Education (CWIE) internship placements.

---

## ✨ Key Features

### 1. 🔍 Corporate Job Board & Application Pipeline
- **Centralized Job Board** — Students can browse, filter, and search active internship postings with details on working hours, monthly allowance/stipend, work modality, and direct contact channels.
- **Rich Multi-Attachment Applications** — Candidates can submit comprehensive applications with multiple itemized attachments (CV, resumes, transcripts, portfolios) and external work links (GitHub, Figma, Google Drive).
- **Standardized Application Lifecycle** — Complete pipeline states:
  $$\text{PENDING} \longrightarrow \text{REVIEWING} \longrightarrow \text{INTERVIEW\_SCHEDULED} \longrightarrow \text{ACCEPTED} \longrightarrow \text{COMMITTED}$$
  Candidates can also be moved to `REJECTED` at screening or post-interview stages.
- **Interview Coordination** — Company HR can schedule formal interviews with custom meeting dates, times, physical room locations, or external conference links (Zoom, Google Meet, MS Teams).
- **Single Placement Exclusivity Engine** — Students may receive multiple offers (`ACCEPTED`), but can commit to **only ONE** placement (`COMMITTED`). Committing to an offer automatically triggers an atomic transaction that auto-declines all competing applications across other employers.
- **Controlled Cancellation Workflow** — Active interns cannot unilaterally abandon a placement. A student must submit a formal release request (`CANCEL_REQUESTED`), requiring explicit review and confirmation by Company HR (`CANCELLED`).
- **Academic Privacy & GPA Masking** — Student GPA and academic credentials are encrypted and masked from unauthorized public viewers, accessible only to verified hiring employers.

### 2. 📅 Daily CWIE Logbook & Attendance Tracking
- **Placement-Guarded Logging** — Logbook access is unlocked only after an official placement commitment (`COMMITTED`).
- **Daily Work Logs (8.0 hrs/day)** — Students log daily hours with work modality (`🏢 On-site`, `💻 Remote / WFH`, `🔄 Hybrid`), itemized deliverables, problems encountered, and technical fixes applied.
- **Backdated Entry Detection (Audit Flag)** — System automatically detects and flags entries logged retroactively, providing mentors and faculty with full transparency on reporting punctuality.
- **Artifact & Evidence Attachments** — Students can attach supporting files (PDF timesheets, code commits, design assets) to substantiate daily activities.

### 3. 🔍 Company Mentor Inspection Drawer & Sign-Off
- **Slide-Over Inspection Drawer** — Company mentors can inspect submitted daily logs, deliverables, and attached artifacts in an organized slide-over drawer without leaving the roster view.
- **Mentor Rating & Feedback** — Mentors award a 1–5 star rating (★) and constructive qualitative remarks for each entry.
- **Official Sign-Off Verification** — Timestamped electronic verification confirming mentor validation of student working hours.

### 4. 🏆 Employer Performance Rubric & Official Certification
- **3-Category Evaluation Rubric** — Corporate supervisors evaluate interns across 3 formal criteria (1–5 Stars):
  1. **Work Quality & Technical Competence**
  2. **Punctuality & Reliability**
  3. **Teamwork & Communication**
- **Qualitative Recommendation Remarks** — Mentors provide open-ended evaluations and employment recommendations.
- **Printable CWIE Completion Certificate** — Generates an official, printable completion report (`window.print()`) featuring student academic metadata, accumulated verified hours, supervisor feedback, and performance scores.

### 5. 🌐 Bilingual Experience & User Profiles
- **Thai & English Support (TH/EN)** — Full bilingual toggle allowing all platform participants to switch between Thai and English instantly.
- **Public Profile Modals** — Slide-over modal allowing students to inspect company background and openings, and employers to review candidate university, faculty, major, year, and technical skill tags.
- **Custom Profile Pictures & Company Logos** — Direct image uploads with instant preview and persistent cloud storage.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React |
| **Backend** | Node.js, Express 5, TypeScript |
| **Database & ORM** | PostgreSQL 16 on Amazon RDS, Prisma 7 ORM |
| **File Storage** | Amazon S3 (`@aws-sdk/client-s3`, Multer S3) |
| **Containerization** | Docker, Docker Compose |
| **Cloud Hosting (AWS)** | Amazon ECS Fargate, Amazon VPC (Multi-AZ), Application Load Balancer (ALB) |
| **Observability & Security** | Amazon CloudWatch, AWS IAM, Bcrypt password hashing, JWT RBAC middleware |

---

## 👤 Demo & Test Accounts

All demo accounts use the standard password: **`password123`**

| Role | Email Address | Password | Account Details |
|---|---|---|---|
| **Company HR** | `hr@techcorp.com` | `password123` | Sarah Jenkins — TechCorp Solutions (Cloud & Enterprise) |
| **Company HR** | `hr@innovate.co` | `password123` | David Chen — Innovate Labs (AI & Data Platforms) |
| **Student** | `student@internflow.com` | `password123` | Alex Rivers — Thammasat University (SIIT), 4th Year CS |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js**: v20 or higher
- **Docker & Docker Compose** (for database container)
- **Git**

### Option 1: Docker Compose (All-in-One)

```bash
# 1. Clone repository
git clone https://github.com/Justsaucz/InternFlow.git
cd InternFlow

# 2. Setup environment variables
cp backend/.env.example backend/.env

# 3. Build and launch all services
docker compose up -d --build

# 4. Open applications:
# Frontend:      http://localhost:3000
# Backend API:   http://localhost:4000
# Prisma Studio: http://localhost:5555
```

### Option 2: Manual Local Setup

```bash
# 1. Start local PostgreSQL (port 5432)
docker compose up -d postgres

# 2. Setup and run Backend
cd backend
npm install
npx prisma db push
npx ts-node src/scripts/seed.ts
npm run dev

# 3. Setup and run Frontend (in a new terminal)
cd ../frontend
npm install
npm run dev
```

Platform URLs:
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:4000`
- **Health Check**: `http://localhost:4000/api/health`

---

## 🔗 Core REST API Endpoints

### 🔐 Authentication & Profile Management
- `POST /api/auth/register` — Register a new account (`STUDENT` or `COMPANY_HR`)
- `POST /api/auth/login` — Authenticate credentials and issue JWT
- `GET /api/student/profile` — Fetch student academic profile & metadata
- `PUT /api/student/profile` — Update student profile, skills, and bio
- `GET /api/company/profile` — Fetch corporate profile & contact details
- `PUT /api/company/profile` — Update company profile & contact details
- `POST /api/upload` — Direct multipart file upload endpoint (CVs, resumes, logbook artifacts)

### 💼 Job Postings & Applications
- `GET /api/jobs` — Browse active job postings (with search & filters)
- `GET /api/jobs/:id` — Retrieve detailed job post
- `POST /api/jobs` — Create new internship opening (HR only)
- `PUT /api/jobs/:id` — Update job post details (HR only)
- `DELETE /api/jobs/:id` — Remove job post with safe cascade handling (HR only)
- `GET /api/jobs/company` — List postings created by the authenticated company
- `POST /api/applications` — Submit an internship application with multi-attachment documents & links
- `GET /api/applications/my` — Candidate view of submitted applications & live statuses
- `GET /api/applications/company` — Employer view of incoming applicants & attached credentials
- `PATCH /api/applications/:id/status` — Update application status (`REVIEWING`, `INTERVIEW_SCHEDULED`, `ACCEPTED`, `REJECTED`, `COMMITTED`, `CANCEL_REQUESTED`, `CANCELLED`)

### 📅 Daily CWIE Logbooks & Mentor Verification
- `POST /api/logbook` — Submit or update a daily logbook entry (hours, modality, deliverables, issues)
- `GET /api/logbook/my` — Retrieve student's daily logbook history & accumulated hours gauge
- `GET /api/logbook/student/:studentId` — Employer view of student logbook entries
- `PUT /api/logbook/:id/approve` — Company mentor sign-off with 1–5★ rating and feedback
- `DELETE /api/logbook/:id` — Delete a logbook entry

### 🏆 Performance Evaluation & Completion Certification
- `GET /api/evaluations/company` — Employer roster of active interns and evaluation statuses
- `POST /api/evaluations/submit` — Submit 3-category rubric evaluation (1–5★) and supervisor remarks
- `GET /api/evaluations/report/:studentId` — Generate official printable CWIE completion report data

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
