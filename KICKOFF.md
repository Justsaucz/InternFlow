# 1. Overview

Students and corporate employers coordinate internship recruitment and operational placements each term, but the process is typically managed through scattered emails, spreadsheets, messaging apps, or paper forms. This leads to lost applications, unclear status tracking, unmonitored internship hours, and delayed performance assessments.

At present, internship workflows are often ad-hoc and informal, relying on manual follow-ups between candidates and hiring teams. This disconnected approach creates gaps in accountability, increases the administrative workload for HR recruiters, and leaves students uncertain about the status of their submissions or the verification of their required internship hours.

To address these challenges, this project proposes a **cloud-based, centralized internship management and tracking platform (InternFlow)** that standardizes how internship positions are listed, applied for, monitored, and evaluated across students and corporate partners.

The platform will include the following key features:
* **Centralized Corporate Job Board** with search, filters, allowance details, working hours, and modality.
* **3-Stage Real-Time Application Pipeline** tracking submissions from application to offer acceptance.
* **Multi-Artifact S3 File Attachments** for resumes, transcripts, portfolios, and external project links.
* **Comprehensive Student Profiles** capturing academic metadata (University name, Faculty, Major, Year, GPA, Skills).
* **Operational Weekly Logbook & Journal** with attendance modality, objective/deliverable pin points, and hour tracking.
* **Company Mentor Review & Sign-Off** featuring 1–5 star weekly ratings, qualitative feedback, and supervisor verification.
* **Employer Performance Rubric & Official Completion Report** consolidating verified hours and multi-dimensional rubric scores.

---

# 2. Problem Statement

The current internship application and evaluation processes are fragmented and rely heavily on manual procedures. These shortcomings result in multiple operational and accountability issues, including:

* **No centralized job board:** Students must search for opportunities across disparate corporate career pages, job boards, social media groups, and campus flyers. There is no single source of truth for verified internship openings.
* **Untraceable application status:** Once an application is submitted via email or Google Forms, students receive no automated visibility into whether it is pending review, undergoing screening, or decided upon, leading to excessive manual inquiries.
* **Unmonitored weekly progress and attendance:** During the internship period, students often compile paper logs only at the end of the term, preventing mentors from verifying attendance, weekly deliverables, and technical problem-solving in real time.
* **Detached performance feedback:** Company feedback is often informal or delayed, making it difficult to generate standardized assessment rubrics and verified completion records.
* **Duplicate and conflicting submissions:** Without a unified database, candidates may submit duplicate applications to the same employer across multiple channels, cluttering HR pipelines and wasting screening time.
* **Inconvenient document handling:** Exchanging CVs, portfolios, and certificates via email attachments introduces file version confusion, security risks, and storage management difficulties.

---

# 3. Key Users

The proposed platform will support two primary user groups, each with distinct roles and responsibilities:

* **Students (internship applicants and practicing interns)**
    * Register and log in using email credentials.
    * Create and maintain an academic profile (University name, Faculty, Major, Year, GPA, Skills, Bio, Avatar).
    * Search and filter corporate internship postings by keyword, department, allowance, and work modality.
    * Submit applications with cover letters, direct S3 file uploads (CVs, portfolios), and external links (GitHub, Figma).
    * Track application progress in real time (`Submitted` ➔ `Under Review` ➔ `Offer Received` ➔ `Confirmed Working` / `Declined`).
    * Record weekly logbook entries with work modality (`On-site`, `Remote`, `Hybrid`), hours, deliverables, and troubleshooting notes.
    * Monitor total logged hours and mentor-approved hours with real-time dashboard counters.
    * Inspect weekly company mentor sign-offs and star ratings.
    * Generate and print official accredited Internship Completion Reports.

* **Company HR & Mentors (corporate recruiters and workplace supervisors)**
    * Register and manage corporate profile (company name, industry, website, logo, address, contact email/phone).
    * Create, edit, publish, and delete internship job postings with full compensation, schedule, and requirement details.
    * Review incoming applicants, view student profiles and university details, and inspect uploaded S3 CVs and portfolio links.
    * Update candidate statuses across the 3-stage recruitment pipeline (`Reviewing`, `Accepted`, `Rejected`).
    * Inspect student weekly logbooks in an inspector drawer showing all objectives, completed tasks, and attached artifacts.
    * Sign off on weekly logbook hours with a 1–5 star weekly rating (★) and qualitative mentor feedback.
    * Submit 3-category performance evaluation rubrics (**Work Quality**, **Punctuality**, **Teamwork**) upon internship completion.
    * Monitor real-time recruitment metrics through a dedicated corporate dashboard.

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
* **Single Placement & Exclusivity Rule**: While students can receive internship offers (`ACCEPTED`) from multiple corporate employers, they are strictly limited to committing to **EXACTLY ONE** official placement (`COMMITTED`).
* **Automatic Auto-Decline of Competing Offers**: Confirming and committing to an internship offer automatically declines/closes all other active applications and offers for that candidate.
* **Company-Approved Cancellation Workflow**: Once committed, a student cannot abandon a placement unilaterally. The student must submit a formal cancellation request stating the reason (`CANCEL_REQUESTED`), and the placement is only released once the corporate employer explicitly confirms and approves (`CANCELLED`).
* **Standardized Status Lifecycle**:
    * `PENDING` → Submitted and awaiting HR screening
    * `REVIEWING` → Under active review by HR
    * `ACCEPTED` → Internship offer extended by corporate employer
    * `COMMITTED` → Student confirmed and working in active placement (unlocks Weekly Logbook)
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

### 5. Weekly Logbook & Journal Management

* Weekly logbook entries are strictly locked until a student holds an active, confirmed placement (`COMMITTED` or `CANCEL_REQUESTED`).
* Students must be able to log weekly journals specifying week number, hours worked (default 40 hours), work modality (`ON_SITE`, `REMOTE`, `HYBRID`), and supervisor name.
* Students must be able to record itemized pin-point lists for **Planned Objectives** and **Actual Deliverables Completed**.
* Students must be able to record technical troubleshooting notes (Problems Encountered & Solutions) and Key Learnings.
* Students must be able to attach external artifact links and upload supporting documents (timesheets, reports, code screenshots).
* Students must be able to edit and delete existing weekly log entries with real-time recalculation of total approved hours.

### 6. Company Mentor Verification & Sign-Off

* Company HR and mentors must be able to inspect placed intern logbooks in an inspector drawer showing all objectives, deliverables, troubleshooting notes, and attached artifacts.
* Company mentors must be able to sign off on weekly logs by setting `mentorApproved = true`, awarding a 1–5 star rating (★), and providing qualitative feedback.
* Students must see real-time mentor approval badges and feedback on their weekly logbook cards.

### 7. Performance Rubric Evaluation & Reports

* Company HR must be able to submit a 3-category evaluation rubric upon internship completion:
    * **Work Quality** (1–5 Stars)
    * **Punctuality & Responsibility** (1–5 Stars)
    * **Communication & Teamwork** (1–5 Stars)
    * **Qualitative Supervisor Remarks**
* The system must generate an official printable **Internship Completion Certificate & Performance Report** (`window.print()`) displaying student university metadata, verified hours, mentor sign-offs, and rubric scores.

### 8. Dashboards & In-App Notifications

* Students must have a dedicated dashboard displaying application counts, review statuses, placed company, and logged hours.
* Company HR must have a dedicated dashboard displaying active job counts, total applicants received, and active placed interns.
* The system must provide global toast notifications for all major user actions (`success`, `error`, `warning`, `info`) with auto-dismiss countdowns.

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
| **Amazon Route 53** | Domain Name System (DNS) service for domain name resolution and intelligent traffic routing. |
| **Amazon CloudFront** | Content Delivery Network (CDN) service caching and delivering frontend static assets globally. |
| **Amazon Simple Storage Service (S3)** | Scalable object storage service for frontend React hosting and student CV/resume/report file storage. |
| **Amazon Elastic Container Service (ECS)** | Fully managed container orchestration service running backend Node.js application containers. |
| **Amazon Elastic Container Registry (ECR)** | Fully managed Docker container registry for securely storing and managing application images. |
| **Amazon Relational Database Service (RDS)** | Managed database service running PostgreSQL 16 Multi-AZ for all relational data. |
| **AWS Identity and Access Management (IAM)** | Centralized identity service managing access permissions, roles, and security credentials. |
| **Amazon CloudWatch** | Observability and monitoring service collecting application logs, performance metrics, and alarms. |

### Micro Components (Infrastructure & Networking Primitives)

| Component Name | Descriptions |
|---|---|
| **Amazon Virtual Private Cloud (VPC)** | Logically isolated virtual network boundary containing all backend compute and database resources. |
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
         ┌─────────────┴─────────────┐
         ▼                           ▼
  ┌──────────────┐            ┌──────────────┐
  │   REJECTED   │            │   ACCEPTED   │ (Company Offer Extended)
  └──────────────┘            └──────┬───────┘
                                     │
                                     ▼ (Student Commits to Offer)
                              ┌──────────────┐
                              │  COMMITTED   │ ──▶ [Weekly Logbook Unlocked]
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
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                        │
│     Users / Browsers (Students, Company HR)                                            │
│         │                                                                              │
│         ▼                                                                              │
│    ┌──────────┐                                                                        │
│    │ Route 53 │ (DNS Resolution)                                                       │
│    └────┬─────┘                                                                        │
│         │                                                                              │
│         ├───────────────────────────────────────┐                                      │
│         │ Path A: Static UI Assets              │ Path B: API Requests (/api/*)        │
│         ▼                                       ▼                                      │
│    ┌─────────────┐                     ┌────────────────────────────────────────────┐  │
│    │ CloudFront  │ (Global CDN)        │                 Amazon VPC                 │  │
│    └────┬────────┘                     │                                            │  │
│         │                              │   ┌──────────────────────────┐             │  │
│         ▼                              │   │  Application Load        │ (Public     │  │
│    ┌─────────────┐                     │   │   Balancer (ALB)         │  Subnet)    │  │
│    │  Amazon S3  │ (Frontend           │   └──────────┬───────────────┘             │  │
│    │ (React App) │  Build)             │              │                             │  │
│    └─────────────┘                     │   ┌──────────▼───────────────┐             │  │
│                                        │   │   Amazon ECS Fargate     │ (Private    │  │
│                                        │   │   Node.js Express API    │  Subnets    │  │
│                                        │   └──────────┬───────────────┘  AZ-A &     │  │
│                                        │              │                  AZ-B)      │  │
│                                        │   ┌──────────┴───────────────┐             │  │
│                                        │   ▼                          ▼             │  │
│  ┌────────────────────┐                │ ┌─────────────────┐        ┌─────────────┐ │  │
│  │ Amazon S3          │ ◀──────────────┼─┤ Amazon RDS      │        │ Amazon S3   │ │  │
│  │ (Regional Service) │    File        │ │ PostgreSQL 16   │        │ VPC Endpoint│ │  │
│  │ (CV/Resume Upload) │    Uploads     │ │ (Primary/Standby│        │ (Gateway)   │ │  │
│  └────────────────────┘                │ └─────────────────┘        └─────────────┘ │  │
│                                        └────────────────────────────────────────────┘  │
│                                                                                        │
│     Supporting Services: Amazon ECR ── Amazon CloudWatch ── AWS KMS ── AWS IAM         │
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

| Person | Area | Key Deliverables |
|---|---|---|
| **1** | Frontend Dashboards (Student, HR UI) | Student & HR Dashboards, Job Board, Application Pipeline UI, Responsive Layouts |
| **2** | Backend Auth, RBAC Logic & Security | Express 5 Architecture, JWT Authentication, RBAC Middleware, Profile APIs |
| **3** | Database Design (Prisma Schema) & Placement Workflows | PostgreSQL Schema, Prisma 7 Migrations, Application Status Workflows |
| **4** | File Upload Integration (Multer + AWS S3) | AWS S3 Integration, Multer S3, Multi-Document Uploads, Avatar Pipelines |
| **5** | DevOps & AWS Cloud Infrastructure | Amazon VPC, ECS Fargate, Application Load Balancer, RDS, Docker Compose |
| **6** | Testing/QA, Logbook & Company Evaluation System, Documentation | Weekly Logbook, Mentor Sign-Off Drawer, Rubrics Engine, README & Kickoff Docs |
