# 1. Overview

Students and corporate employers coordinate internship recruitment and operational placements each term, but the process is typically managed through scattered emails, spreadsheets, messaging apps, or paper forms. This leads to lost applications, unclear status tracking, unmonitored internship hours, and delayed performance assessments.

At present, internship workflows are often ad-hoc and informal, relying on manual follow-ups between candidates and hiring teams. This disconnected approach creates gaps in accountability, increases the administrative workload for HR recruiters, and leaves students uncertain about the status of their submissions or the verification of their required internship hours.

To address these challenges, this project proposes a **cloud-based, centralized internship management and tracking platform (InternFlow)** that standardizes how internship positions are listed, applied for, monitored, and evaluated across students and corporate partners.

The platform will include the following key features:
* **Centralized Corporate Job Board** with search, filters, allowance details, working hours, and modality.
* **Multi-Stage Real-Time Application Pipeline** **tracking candidate submissions from initial application, screening, documentary interview scheduling (`INTERVIEW_SCHEDULED`), offer extension, single-placement exclusivity commitment, through company-approved cancellation.**
* **Single Placement & Exclusivity Rule** preventing candidate hoarding by automatically declining competing offers upon commitment.
* **Multi-Artifact S3 File Attachments** for resumes, transcripts, portfolios, and external project links.
* **Comprehensive Student Profiles** capturing academic metadata (University name, Faculty, Major, Year, GPA, Skills).
* **Operational Daily CWIE Logbook** **with attendance modality (`On-site`, `Remote`, `Hybrid`), tasks completed, problems/solutions, backdated detection, and hour tracking.**
* **Company Mentor Review & Sign-Off** featuring 1–5 star ratings, qualitative feedback, and supervisor verification drawer.
* **Employer Performance Rubric & Official Completion Report** consolidating verified hours and multi-dimensional rubric scores.
* **Bilingual Support (TH / EN)** **providing seamless real-time language switching across the entire platform.**

---

# 2. Problem Statement

The current internship application and evaluation processes are fragmented and rely heavily on manual procedures. These shortcomings result in multiple operational and accountability issues, including:

* **No centralized job board:** Students must search for opportunities across disparate corporate career pages, job boards, social media groups, and campus flyers. There is no single source of truth for verified internship openings.
* **Untraceable application status:** Once an application is submitted via email or Google Forms, students receive no automated visibility into whether it is pending review, undergoing screening, or decided upon, leading to excessive manual inquiries.
* **Unmonitored progress and attendance:** During the internship period, students often compile paper logs only at the end of the term, preventing mentors from verifying attendance, daily/weekly deliverables, and technical problem-solving in real time.
* **Detached performance feedback:** Company feedback is often informal or delayed, making it difficult to generate standardized assessment rubrics and verified completion records.
* **Duplicate submissions:** Without a unified database, candidates may submit duplicate applications to the same employer across multiple channels, cluttering HR pipelines and wasting screening time.
* **Inconvenient document handling:** Exchanging CVs, portfolios, and certificates via email attachments introduces file version confusion, security risks, and storage management difficulties.

---

# 3. Key Stakeholders

The proposed platform will support two primary user groups, each with distinct roles and responsibilities:

* **Students (internship applicants and practicing interns)**
    * Search and filter corporate internship postings by department, allowance, and work modality.
    * Submit applications with resumes, portfolios, and external project links (e.g., GitHub, Figma, Drive).
    * **Track application status in real time (`PENDING` ➔ `REVIEWING` ➔ `INTERVIEW_SCHEDULED` ➔ `ACCEPTED` ➔ `COMMITTED`).**
    * **Receive interview notification banners (`INTERVIEW_SCHEDULED`) to prepare for external interview arrangements from HR.**
    * Confirm acceptance for a single official placement (`COMMITTED`), automatically declining competing offers.
    * **Record daily CWIE logbook entries with working hours (default 8.0 hrs/day), work modality, deliverables, troubleshooting notes, and backdated detection warnings.**
    * Monitor mentor-verified hours and generate official internship completion reports.

* **Company HR & Mentors (corporate recruiters and workplace supervisors)**
    * Publish and manage internship job listings with compensation, schedule, and requirements.
    * Review candidate profiles, download resumes, and evaluate incoming applications.
    * **Advance candidate statuses through the recruitment pipeline: Reviewing ➔ Schedule Interview (`INTERVIEW_SCHEDULED`) ➔ Extend Offer (`ACCEPTED`) ➔ Reject (`REJECTED`).**
    * **Use the "Schedule Interview" ("นัดสัมภาษณ์") button to indicate applicant shortlisting and display an in-app notice, while coordinating actual interview meetings externally via email/phone.**
    * Review student placement cancellation requests (`CANCEL_REQUESTED` ➔ `CANCELLED`).
    * **Inspect student daily logbooks in an interactive inspector drawer, approve hours, and provide 1–5 star ratings with qualitative feedback.**
    * Submit final performance rubric evaluations upon internship completion.

---

# 4. Functional requirements

### 1. User Management & Profile System

* The system must provide a secure authentication mechanism for users to register and log in.
* Authentication must use email and password credentials with server-side validation.
* Passwords must be hashed using bcrypt (work factor of 10) before storage; plaintext passwords must never be persisted.
* Upon successful login, the system must issue a JSON Web Token (JWT) with a 24-hour expiration for session management.
* The system allows 2 roles:
    * **Students** (internship seekers and interns)
    * **Company HR** (corporate recruiters and mentors)
* The system must automatically initialize and upsert the appropriate role-specific profile (`StudentProfile` or `CompanyProfile`).
* Students must be able to maintain academic metadata including University name (`university`), Faculty, Major, Year, GPA, Technical Skills, Bio, and Avatar.
* Academic GPA must be masked and protected from unauthorized public viewers, accessible only to authenticated corporate HR recruiters.
* Company HR must be able to manage corporate profile details (company name, industry, website, logo, address, recruiter contact email/phone).
* Users must be able to inspect public profiles of other platform participants via a slide-over modal (`PublicProfileModal`).

### 2. Job Posting Management

* Company HR must be able to create, edit, and publish internship job postings with the following details:
    * Position title, department, job description, requirements, office location, remote availability, and openings count.
    * **Working Hours & Schedule:** (e.g., `Mon - Fri, 09:00 - 18:00`)
    * **Allowance & Compensation:** (e.g., `15,000 THB/month`)
    * **Contact Information:** Email, phone number, and LINE ID / @Official
    * **Application Link:** Optional external career portal link
    * **Active Status Flag:** Ability to toggle postings open or closed
* Company HR must be able to delete job postings with an in-app confirmation modal and transactional cascade cleanup of related application records.
* Students must be able to browse all active job listings sorted by most recent.
* Students must be able to search and filter jobs by keyword, department, remote work, or on-site modality.

### 3. Application Pipeline, Commitment & Cancellation Workflow

* Students must be able to submit applications with cover letters, direct file uploads (CVs/Portfolios), and external URLs (GitHub, Figma, Drive).
* The system must strictly enforce the **One Active Application Per Company Rule** to prevent candidate spamming and maintain organized employer review workflows.
* **Interview Scheduling Status (`INTERVIEW_SCHEDULED`)**:
    * **Company HR can click the "Schedule Interview" ("นัดสัมภาษณ์") button on an applicant card to transition the application status to `INTERVIEW_SCHEDULED`.**
    * **Operational Scope: This status serves as a workflow notice indicator on the platform to notify the candidate that they passed resume screening and an interview is being arranged.**
    * **It is not an integrated video call feature; HR contacts the student directly via email or phone to coordinate the interview date, time, physical office location, or meeting link (Google Meet, Zoom, MS Teams).**
    * **From `INTERVIEW_SCHEDULED`, HR can either extend an official offer (`ACCEPTED`) or decline the candidate (`REJECTED`).**
* **Single Placement & Exclusivity Rule**: While students can receive internship offers (`ACCEPTED`) from multiple corporate employers, they are strictly limited to committing to **EXACTLY ONE** official placement (`COMMITTED`).
* **Automatic Auto-Decline of Competing Applications & Offers**: Confirming and committing to an internship offer automatically declines/closes all other active applications and stages (`PENDING`, `REVIEWING`, `INTERVIEW_SCHEDULED`, and competing `ACCEPTED` offers) for that candidate across competing companies, ensuring full placement exclusivity.
* **Company-Approved Cancellation Workflow**: Once committed, a student cannot abandon a placement unilaterally. The student must submit a formal cancellation request stating the reason (`CANCEL_REQUESTED`), and the placement is only released once the corporate employer explicitly confirms and approves (`CANCELLED`).
* **Standardized Status Lifecycle**:
    * `PENDING` → Submitted and awaiting HR screening
    * `REVIEWING` → Under active review by HR
    * **`INTERVIEW_SCHEDULED` → Shortlisted for interview; HR coordinating external schedule/meeting link**
    * `ACCEPTED` → Internship offer extended by corporate employer
    * **`COMMITTED` → Student confirmed and working in active placement (unlocks Daily CWIE Logbook)**
    * `CANCEL_REQUESTED` → Student requested cancellation; awaiting company HR review
    * `CANCELLED` → Company HR approved release; placement officially terminated
    * `REJECTED` → Application declined or automatically closed upon committing elsewhere
* Students must be able to view all submitted applications with current status badges, company details, cover letters, and commitment/cancellation action buttons.
* Company HR must be able to view an applicant roster with candidate university details, CV download links, offer extension controls, and cancellation review action buttons.

### 4. File Upload & Storage Management

* The system must support file uploads for CVs, resumes, portfolios, avatars, and logbook artifacts with a maximum file size of 10 MB.
* In production, files must be uploaded directly to Amazon S3 using the AWS SDK v3 (`@aws-sdk/client-s3`) with `multer-s3`.
* In local development, the system must automatically fall back to local disk storage when AWS credentials are not present.
* Uploaded filenames must be sanitized and prepended with unique timestamps to prevent S3 object key collisions.

### 5. **Daily CWIE Logbook Management**

* **Daily logbook entries are strictly locked until a student holds an active, confirmed placement (`COMMITTED` or `CANCEL_REQUESTED`).**
* **Students must be able to record daily logbook entries specifying work date, hours worked (1.0–12.0 hours, default 8.0 hrs/day), work modality (`ON_SITE`, `REMOTE`, `HYBRID`), and supervisor name.**
* **Students must be able to record itemized pin-point lists for Completed Tasks, technical troubleshooting notes (Problems Encountered & Solutions), and Key Learnings.**
* **Students must be able to attach external artifact links and upload supporting documents (timesheets, reports, code screenshots).**
* **Backdated Submission Detection: The system automatically detects when a log is submitted for a past date (> 48 hours), flagging the entry as `isBackdated = true` and displaying an amber warning badge for student and mentor review.**
* **The system enforces a calendar-day uniqueness constraint (`studentId + logDate`) preventing multiple journal entries for the same date.**
* **Students must be able to monitor their total logged hours and supervisor-approved hours against the required target (e.g., 400 hours).**

### 6. Company Mentor Verification & Sign-Off

* **Company HR and mentors must be able to inspect placed intern logbooks in an interactive slide-over inspector drawer showing all objectives, deliverables, troubleshooting notes, and attached artifacts.**
* **Company mentors must be able to sign off on daily logs individually or batch-approve entire weekly periods with a 1–5 star rating (★) and qualitative mentor feedback.**
* Students must see real-time mentor approval badges and feedback on their logbook cards.

### 7. Performance Rubric Evaluation & Reports

* Company HR must be able to submit a 3-category evaluation rubric upon internship completion:
    * **Work Quality & Technical Competence** (1–5 Stars)
    * **Punctuality & Responsibility** (1–5 Stars)
    * **Communication & Teamwork** (1–5 Stars)
    * **Qualitative Supervisor Remarks**
* **The system must generate an official printable Internship Completion Certificate & Performance Report (`window.print()`) displaying student university metadata, verified hours, mentor sign-offs, and rubric scores.**

### 8. Dashboards & In-App Notifications

* Students must have a dedicated dashboard displaying application counts, review statuses, placed company, and logged hours.
* Company HR must have a dedicated dashboard displaying active job counts, total applicants received, and active placed interns.
* The system must provide global toast notifications for all major user actions (`success`, `error`, `warning`, `info`) with auto-dismiss countdowns.

### 9. **Bilingual Support (TH / EN)**

* **The platform must provide full client-side internationalization with persistent language selection (`th` / `en`) via `LanguageContext` and browser local storage.**
* **Dynamic language toggle must instantly switch navigation labels, status badges, forms, modals, error toasts, and printable reports without page reloading.**

---

# 5. Nonfunctional Requirements

### 1. Performance

* The response time for all API requests must be less than 2 seconds under standard load.
* Dashboard analytics and statistics must be computed on-demand and returned within 1 second.
* File uploads up to 10 MB must complete within 10 seconds under standard broadband connectivity.

### 2. Scalability

* The system must support at least 100 concurrent active users without performance degradation.
* The architecture must support horizontal scaling via Amazon ECS Fargate container auto-scaling.
* File storage must leverage Amazon S3 for virtually unlimited storage scalability.

### 3. Reliability

* The system must operate with a 99.5% target uptime during operational hours.
* Multi-table write operations must use Prisma database transactions to guarantee atomicity and prevent partial state writes.
* Failed operations must not fail silently; errors must be logged to CloudWatch and surfaced via in-app toast alerts.

### 4. Data Integrity

* Unique database constraints must prevent duplicate applications per job and duplicate active submissions per company.
* Application status transitions must be strictly validated server-side.
* All write operations must be enforced by JWT authentication and Role-Based Access Control (RBAC) middleware.

### 5. Usability

* Users must be able to perform common actions (search, apply, review, log hours, evaluate) intuitively without external training.
* The interface must provide immediate visual feedback (loading spinners, skeleton loaders, success/error banners).
* The UI must be fully responsive across desktop, tablet, and mobile devices (minimum viewport width 360px).

### 6. Data Quality

* All required form fields must be validated on both client-side and server-side before database persistence.
* Email addresses must adhere to valid format standards.
* Numerical fields (GPA 0.00–4.00, Year 1–6, Hours, Rubric Scores 1–5) must be bounded by validation rules.

### 7. Data Storage

* All structured relational data must be persisted in an Amazon RDS PostgreSQL 16 database managed via Prisma 7 ORM.
* All binary files (CVs, resumes, avatars, reports) must be stored in Amazon S3 buckets with organized path prefixes.
* Database schemas must be version-controlled through reproducible Prisma migrations.

### 8. Security

* All passwords must be salted and hashed using bcrypt (10 rounds).
* Protected API routes must verify JWT tokens in the `Authorization: Bearer` header (401 for unauthorized access).
* S3 access must be governed by least-privilege IAM policies (`s3:PutObject`, `s3:GetObject`).
* CORS must be configured to accept requests only from authorized frontend domains.

### 9. Documentation

* The project must maintain an up-to-date `README.md`, `KICKOFF.md`, and `REST_API.md`.
* System architecture must be documented with comprehensive AWS infrastructure diagrams.

---

# 6. Programming Language

* TypeScript
* JavaScript
* HTML5
* CSS3
* SQL

---

# 7. Cloud Technology Components

### Main Components (Standalone Managed Cloud Services)

| Component Name | Descriptions |
|---|---|
| **Amazon Simple Storage Service (S3)** | Scalable object storage service for student CV/resume file storage and frontend static hosting. |
| **Amazon Elastic Container Service (ECS)** | Fully managed container orchestration service running backend Node.js application containers. |
| **Amazon Elastic Container Registry (ECR)** | Fully managed Docker container registry for securely storing and managing application images. |
| **Amazon Relational Database Service (RDS)** | Managed database service running PostgreSQL 16 Multi-AZ for all relational data. |
| **AWS Identity and Access Management (IAM)** | Centralized identity service managing access permissions, roles, and security credentials. |
| **Amazon CloudWatch** | Observability and monitoring service collecting application logs, performance metrics, and alarms. |

### Micro Components (Infrastructure & Networking Primitives)

| Component Name | Descriptions |
|---|---|
| **Amazon Virtual Private Cloud (VPC)** | Logically isolated virtual network boundary containing all backend compute and database resources. |
| **Public & Private Subnets** | Multi-AZ network segmentation: Public subnets for ALBs; Private subnets for ECS Fargate tasks; Isolated subnets for RDS. |
| **Elastic Load Balancing (ALB)** | Network appliance component distributing incoming API requests across backend container targets. |
| **Security Groups** | Stateful virtual firewalls controlling inbound/outbound port-level traffic for VPC resources. |

---

# 8. System Diagram

### 1. Application & Placement Lifecycle State Diagram

```text
               ┌───────────────┐
               │    PENDING    │ (Student Submitted Application)
               └───────┬───────┘
                       │
                       ▼
               ┌───────────────┐
               │   REVIEWING   │ (HR Screening & Candidate Evaluation)
               └───────┬───────┘
                       │
         ┌─────────────┼────────────────────────┐
         │             │                        │
         ▼             ▼                        ▼
  ┌──────────────┐ ┌───────────────────────┐ ┌──────────────┐
  │   REJECTED   │ │  INTERVIEW_SCHEDULED  │ │   ACCEPTED   │ (Direct Offer Extended)
  └──────────────┘ │ (Documentary Notice   │ └──────┬───────┘
                   │  HR Coordinates Ext.) │        │
                   └───────────┬───────────┘        │
                               │                    │
                     ┌─────────┴─────────┐          │
                     ▼                   ▼          │
              ┌──────────────┐    ┌──────────────┐  │
              │   REJECTED   │    │   ACCEPTED   │◀─┘ (Offer Extended Post-Interview)
              └──────────────┘    └──────┬───────┘
                                         │
                                         ▼ (Student Commits to Offer)
                                  ┌──────────────┐
                                  │  COMMITTED   │ ──▶ [Daily CWIE Logbook Unlocked]
                                  └──────┬───────┘     [All Other Offers Auto-Declined]
                                         │
                                         ▼ (Student Requests Cancellation)
                                  ┌──────────────────┐
                                  │ CANCEL_REQUESTED │ (Pending Company Review)
                                  └──────┬───────────┘
                                         │
                          ┌──────────────┴──────────────┐
                          ▼ (HR Rejects Release)        ▼ (HR Approves Release)
                   ┌──────────────┐              ┌──────────────┐
                   │  COMMITTED   │              │  CANCELLED   │ (Released & Free to Re-apply)
                   └──────────────┘              └──────────────┘
```

### 2. Production AWS Infrastructure Architecture Diagram
```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                        │
│     Users / Browsers (Students, Company HR)                                            │
│         │                                                                              │
│         │ (Web & API Requests)                                                         │
│         ▼                                                                              │
│    ┌──────────────────────────────────────────────────────────────────────────────┐    │
│    │                                 Amazon VPC                                   │    │
│    │                                                                              │    │
│    │   ┌──────────────────────────────────────────────┐                           │    │
│    │   │  Application Load Balancer (ALB)             │ (Public Subnet)           │    │
│    │   └──────────────────────┬───────────────────────┘                           │    │
│    │                          │                                                   │    │
│    │                          ▼ (/api/*)                                          │    │
│    │   ┌──────────────────────────────────────────────┐                           │    │
│    │   │  Amazon ECS Fargate (Node.js Express API)    │ (Private Subnets          │    │
│    │   │                                              │  AZ-A & AZ-B)             │    │
│    │   └──────────────┬───────────────────────────────┘                           │    │
│    │                  │                                                           │    │
│    │                  ▼ (Port 5432)                                               │    │
│    │   ┌──────────────────────────────────────────────┐                           │    │
│    │   │  Amazon RDS PostgreSQL 16                    │ (Isolated DB Subnets)     │    │
│    │   └──────────────────────────────────────────────┘                           │    │
│    └──────────────────────────┬───────────────────────────────────────────────────┘    │
│                               │                                                        │
│                               ▼ (S3 API File Uploads: CVs & Portfolios)                │
│                    ┌──────────────────────────────────┐                                │
│                    │  Amazon Simple Storage Service   │                                │
│                    │  (Amazon S3 Bucket)              │                                │
│                    └──────────────────────────────────┘                                │
│                                                                                        │
│     Supporting Services: Amazon ECR ── AWS IAM ── Amazon CloudWatch                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# 9. Framework and Tools

| Category | Technology / Tool |
|---|---|
| **Frontend** | React 19 with Vite |
| **Styling** | Tailwind CSS v4 |
| **Backend** | Express.js 5 (Node.js) |
| **ORM** | Prisma 7 |
| **Database** | PostgreSQL 16 on Amazon RDS |
| **Authentication** | JSON Web Token (JWT) + bcrypt |
| **File Upload** | Multer + multer-s3 |
| **Cloud SDK** | AWS SDK v3 (`@aws-sdk/client-s3`) |
| **Containerization** | Docker + Docker Compose, Amazon ECR |
| **Version Control** | Git + GitHub |
| **Project Management** | Jira Software (Agile Scrum & Sprint Tracking) |
| **Icons** | Lucide React |
| **Monitoring** | Amazon CloudWatch |

---

# 10. Team Responsibilities

| Member Name & Student ID | Core Area | Key Technical Deliverables |
|---|---|---|
| **Nipparn Penjinda** (6622772869) | Full-Stack Architecture & Application Pipeline | Lead Application Pipeline UI, Job Board Filters, Public Profile Modals, Frontend State Architecture |
| **Trin Kittacharoenchai** (6622770392) | Backend Security, Auth & RBAC Middleware | Express 5 REST API Routing, JWT Authentication, Bcrypt Password Hashing, RBAC Access Controls |
| **Napat Pumim** (6622780144) | Database Design & Placement Exclusivity Engine | Prisma 7 Relational Schemas, PostgreSQL Migrations, Atomic Placement Commitment & Auto-Decline Transactions |
| **Thanyawach Keaohan** (6622780094) | Cloud DevOps & AWS Infrastructure | Amazon VPC Network Architecture, ECS Fargate Container Orchestration, ALB, S3 Direct Streaming, Docker Compose |
| **Thantip Kangwanwanit** (6622781217) | CWIE Logbook, Evaluation Engine & QA Automation | Daily CWIE Logbook, Backdated Detection Logic, Mentor Rubric Engine, Robot Framework Automated Test Suite |
