# SIRINDHORN INTERNATIONAL INSTITUTE OF TECHNOLOGY
### THAMMASAT UNIVERSITY
### SCHOOL OF INFORMATION, COMPUTER AND COMMUNICATION TECHNOLOGY

---

# Final Project Report
## **InternFlow — Cloud-Based Centralized Internship Management and Tracking Platform**

**Course:** DES424 Cloud-based Application Development  
**Academic Year:** Semester 1, Academic Year 2026  
**Degree Program:** Digital Engineering (DE) / Computer Engineering (CPE)  

### **Group Members**
1. **6622772869** Nipparn Penjinda
2. **6622770392** Trin Kittacharoenchai
3. **6622780144** Napat Pumim
4. **6622780094** Thanyawach Keaohan
5. **6622781217** Thantip Kangwanwanit

**Submitted To:**  
Dr. Apichon Witayangkurn  
School of Information, Computer and Communication Technology (ICT)  
Sirindhorn International Institute of Technology (SIIT), Thammasat University  

**Date of Submission:** October 2026  

---

## **Table of Contents**

1. [Section 1: Revised Kick-Off Document](#section-1-revised-kick-off-document)
   - 1.1 Project Overview
   - 1.2 Problem Statement
   - 1.3 Key Stakeholders
   - 1.4 Functional Requirements
   - 1.5 Nonfunctional Requirements
   - 1.6 Core Languages
   - 1.7 Cloud Infrastructure
   - 1.8 System Architecture
   - 1.9 Tech Stack & Tooling
2. [Section 2: Software Architecture (Lecture 3 Topics)](#section-2-software-architecture-lecture-3-topics)
   - 2.1 Subsystem Decomposition & Layered Architectural Style
   - 2.2 Data Management (Persistent, Storage, Transient, and Integrity)
   - 2.3 Boundary Conditions (Initialization, Termination, and Failure Modes)
   - 2.4 Access Control & Security Architecture
3. [Section 3: Detailed Design](#section-3-detailed-design)
   - 3.1 Entity-Relationship (ER) Diagram & Schema Specification
   - 3.2 System Architecture Diagram with Cloud Mapping
   - 3.3 Workflow of the System (End-to-End User Journeys & Flowchart)
4. [Section 4: Testing Report](#section-4-testing-report)
   - 4.1 Testing Strategy & Methodology
   - 4.2 User Acceptance Test (UAT) Results Matrix
   - 4.3 Automated Test Suite Scripts (Robot Framework & Playwright)
   - 4.4 Automated Test Execution Results & Metrics
5. [Section 5: User Manual & Prototype Interface](#section-5-user-manual--prototype-interface)
   - 5.1 Authentication, Role Onboarding & Profile Management
   - 5.2 Job Discovery & Multi-Artifact Application Submission
   - 5.3 Candidate Screening, Interview Scheduling & Offer Management
   - 5.4 CWIE Daily Logbook, Modality Tracking & Backdated Auditing
   - 5.5 Mentor Inspection Drawer, 5-Star Sign-Off & Official Completion Certificate
6. [Section 6: Project Links & Repository](#section-6-project-links--repository)

---

# Section 1: Revised Kick-Off Document

## 1.1 Project Overview

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

## 1.2 Problem Statement

The current internship application and evaluation processes are fragmented and rely heavily on manual procedures. These shortcomings result in multiple operational and accountability issues, including:

* **No centralized job board:** Students must search for opportunities across disparate corporate career pages, job boards, social media groups, and campus flyers. There is no single source of truth for verified internship openings.
* **Untraceable application status:** Once an application is submitted via email or Google Forms, students receive no automated visibility into whether it is pending review, undergoing screening, or decided upon, leading to excessive manual inquiries.
* **Unmonitored progress and attendance:** During the internship period, students often compile paper logs only at the end of the term, preventing mentors from verifying attendance, daily/weekly deliverables, and technical problem-solving in real time.
* **Detached performance feedback:** Company feedback is often informal or delayed, making it difficult to generate standardized assessment rubrics and verified completion records.
* **Duplicate submissions:** Without a unified database, candidates may submit duplicate applications to the same employer across multiple channels, cluttering HR pipelines and wasting screening time.
* **Inconvenient document handling:** Exchanging CVs, portfolios, and certificates via email attachments introduces file version confusion, security risks, and storage management difficulties.

---

## 1.3 Key Stakeholders

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

## 1.4 Functional Requirements

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
    * **Company HR can click the "Schedule Interview" button on an applicant card to transition the application status to `INTERVIEW_SCHEDULED`.**
    * **Operational Scope: This status serves as a workflow notice indicator on the platform to notify the candidate that they passed resume screening and an interview is being arranged.**
    * **It is not an integrated video call feature; HR contacts the student directly via email or phone to coordinate the interview date, time, physical office location, or meeting link (Google Meet, Zoom, MS Teams).**
    * **From `INTERVIEW_SCHEDULED`, HR can either extend an official offer (`ACCEPTED`) or decline the candidate (`REJECTED`).**
* **Single Placement & Exclusivity Rule**: While students can receive internship offers (`ACCEPTED`) from multiple corporate employers, they are strictly limited to committing to **EXACTLY ONE** official placement (`COMMITTED`).
* **Automatic Auto-Decline of Competing Offers**: Confirming and committing to an internship offer automatically declines/closes all other active applications and offers for that candidate across competing companies.
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
* Uploaded filenames must be sanitized and prepended with unique timestamps to prevent S3 object key collisions.

### 5. **Daily & Weekly CWIE Logbook Management**
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

## 1.5 Nonfunctional Requirements

### 1. Performance
* The response time for all API requests must be less than 2 seconds under standard load.
* Dashboard analytics and statistics must be computed on-demand and returned within 1 second.
* File uploads up to 10 MB must complete within 10 seconds under standard broadband connectivity.

### 2. Scalability
* The system must support at least 100 concurrent active users without performance degradation.
* The architecture must support horizontal scaling via Amazon ECS Fargate container auto-scaling.

### 3. Reliability
* The system must operate with a 99.5% target uptime during operational hours.
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
* S3 access must be governed by least-privilege IAM policies.
* CORS must be configured to accept requests only from authorized frontend domains.

---

## 1.6 Core Languages

* TypeScript
* JavaScript
* HTML
* CSS
* SQL

---

## 1.7 Cloud Infrastructure

The following tables detail the primary and micro-level infrastructure components utilized within the AWS ecosystem to ensure a robust and scalable environment for InternFlow.

### Main Components

| Component Name | Descriptions |
|---|---|
| **Amazon Simple Storage Service (S3)** | Scalable object storage service for student CV/resume file storage and frontend static hosting. |
| **Amazon Elastic Container Service (ECS)** | Fully managed container orchestration service running backend Node.js application containers. |
| **Amazon Elastic Container Registry (ECR)** | Fully managed Docker container registry for securely storing and managing application images. |
| **Amazon Relational Database Service (RDS)** | Managed database service running PostgreSQL 16 for all relational data (Users, Jobs, Applications). |
| **AWS Identity and Access Management (IAM)** | Centralized identity service managing access permissions, roles, and security credentials. |
| **Amazon CloudWatch** | Observability and monitoring service collecting application logs, performance metrics, and alarms. |

### Micro Components

| Component Name | Descriptions |
|---|---|
| **Amazon Virtual Private Cloud (VPC)** | Logically isolated virtual network boundary containing all backend compute and database resources. |
| **Public & Private Subnets** | Multi-AZ network segmentation: Public subnets for ALBs; Private subnets for ECS Fargate tasks; Isolated subnets for RDS. |
| **Elastic Load Balancing (ELB / ALB)** | Network appliance component distributing incoming API requests across backend container targets. |
| **Security Groups** | Stateful virtual firewalls controlling inbound/outbound port-level traffic for VPC resources. |

---

## 1.8 System Architecture

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

## 1.9 Tech Stack & Tooling

| Category | Technology / Tool |
|---|---|
| **Frontend** | React 19 with Vite |
| **Styling** | Tailwind CSS v4 |
| **Backend** | Express.js 5 (Node.js) |
| **ORM** | Prisma 7 |
| **Database** | PostgreSQL 16 |
| **Authentication** | JSON Web Token (JWT) |
| **File Upload** | Multer + multer-s3 |
| **Cloud SDK** | AWS SDK v3 (`@aws-sdk/client-s3`) |
| **Containerization** | Docker + Docker Compose |
| **Version Control** | Git + GitHub |
| **Project Management** | Jira Software (Agile Scrum, Sprint Planning & Task Tracking) |
| **Monitoring** | Amazon CloudWatch |

---

# Section 2: System Architecture Diagram with Cloud

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                        │
│     Users / Browsers (Students, Company HR, Mentors)                                   │
│         │                                                                              │
│         ├───────────────────────────────────────┐                                      │
│         │ Path A: Static UI Assets (Direct S3)  │ Path B: API Requests (/api/*)        │
│         ▼                                       ▼                                      │
│    ┌─────────────┐                     ┌────────────────────────────────────────────┐  │
│    │  Amazon S3  │ (Static             │                 Amazon VPC                 │  │
│    │ (Frontend   │  Website            │   ┌──────────────────────────┐             │  │
│    │  Hosting)   │  Hosting)           │   │  Application Load        │ (Public     │  │
│    └─────────────┘                     │   │   Balancer (ALB)         │  Subnets)   │  │
│                                        │   └──────────┬───────────────┘             │  │
│                                        │              │                             │  │
│                                        │   ┌──────────▼───────────────┐             │  │
│                                        │   │   Amazon ECS Fargate     │ (Private    │  │
│                                        │   │   Node.js Express API    │  Subnets    │  │
│                                        │   └──────────┬───────────────┘  AZ-A &     │  │
│                                        │              │                  AZ-B)      │  │
│                                        │              ├─────────────────────────────┤  │
│                                        │              ▼                             ▼  │
│  ┌────────────────────┐                │   ┌───────────────────────┐                   │
│  │ Amazon S3          │ ◀──────────────┼───┤ Amazon RDS            │                   │
│  │ (Regional Service) │    File        │   │ PostgreSQL 16         │                   │
│  │ (CV/Resume Upload) │    Uploads     │   │ (Isolated DB Subnets) │                   │
│  └────────────────────┘                │   └───────────────────────┘                   │
│                                        └────────────────────────────────────────────┘  │
│                                                                                        │
│     Supporting Services: Amazon ECR ── AWS IAM ── Amazon CloudWatch                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

The figure above is an illustration of InternFlow's cloud system architecture deployed on Amazon Web Services (AWS). The Amazon S3 bucket configured with static website hosting is used to host the InternFlow user interface (React application), allowing students, corporate HR recruiters, and university mentors to access the platform directly without requiring dedicated web server virtual machines. 

The request from the user application is sent to the backend API via the Application Load Balancer (ALB) situated in the public subnet, which verifies health checks and distributes traffic across containerized Node.js Express services running on Amazon ECS Fargate inside private subnets across two Availability Zones (Multi-AZ). When a user requests or modifies platform data—such as user credentials, internship job postings, application stages (`INTERVIEW_SCHEDULED`, `COMMITTED`), or CWIE daily logbook entries—the data is queried and stored securely in Amazon Relational Database Service (RDS) running PostgreSQL 16 located in an isolated database subnet. When a student uploads an internship document such as a CV, resume, or academic transcript, the backend streams the file directly to a dedicated Amazon S3 bucket for persistent object storage, while storing only the verified file URL reference in the database.

This architecture ensures high availability, strict subnet isolation, and zero-downtime scalability while keeping operational costs minimal by leveraging AWS Fargate serverless containers and Amazon S3 static hosting.

---

# Section 3: Software Architecture

## Subsystem Decomposition

The diagram below illustrates the different subsystems implemented into InternFlow.

![Subsystem Decomposition](file:///d:/Work2/Project/docs/subsystem_decomposition.png)

## Data Management

### Persistent data
* Uploaded resumes, transcripts, and CWIE logbook artifacts are stored in AWS S3
  * Bucket: `internflow-documents`
  * File name: `resume_{studentId}_{timestamp}.pdf`
    * `studentId` means student identification number
    * `timestamp` means file upload timestamp (YYYYMMDD_HHMMSS)
* User Information, Job Postings, Application Stages, CWIE Daily Logbooks, and Evaluation Records are stored in Amazon RDS for PostgreSQL

## Boundary Conditions

### Initialization
When a user accesses the web application, the frontend is fetched from Amazon S3. The application checks the browser's local storage for an active JWT session token. If authenticated, it sends an initial HTTP request (`GET /api/jobs` or `GET /api/student/profile`) to the backend API via the Application Load Balancer to populate the interface while displaying a loading skeleton on screen. If unauthenticated, the user is redirected to the login screen.

### Termination
For our system, the cloud infrastructure (Amazon ECS Fargate containers and Amazon RDS) is designed to run continuously and is not allowed to be terminated. Termination only occurs at the user session level when a user logs out, which clears the JWT authentication token from the browser. On the backend, container termination only occurs when an administrator triggers a rolling deployment update or stops the service.

### Failure
When an error occurs (such as invalid credentials, bad inputs, or network issues), an alert toast notification popup is displayed on the user interface. If a backend container fails or crashes, Amazon ECS Fargate automatically provisions a replacement container to restore service. In addition, all operational and error logs are captured in Amazon CloudWatch to monitor system health and alert administrators.

## Access Control and Security

InternFlow implements Role-Based Access Control (RBAC) enforced by JWT authentication middleware to restrict actions and separate privileges strictly between Student and Company HR roles.

![Access Control and Security](file:///d:/Work2/Project/docs/access_control_security.png)



---

# Detailed Design

## ER diagram

In this section, PostgreSQL (managed on Amazon RDS for PostgreSQL) is used for our database system which is a relational database management system (RDBMS). The Entity-Relationship (ER) diagram representing the database schema, tables, primary keys (PK), foreign keys (FK), data types, and relational constraints is shown in the following diagram.

![ER diagram](file:///d:/Work2/Project/docs/er_diagram.png)

* In the Users table, id is a UUID (String) which defines the primary key (PK) of each user.
* In the StudentProfiles and CompanyProfiles tables, userId is used as a foreign key (FK) with a unique constraint (1:1 relationship) to define which user account owns each profile.
* In the JobPosts table, companyProfileId is used as the foreign key (FK) to define which company posted that internship position.
* In the Applications table, studentId and jobPostId are foreign keys (FK) to define which student submitted the application for which job posting. A composite unique constraint on [studentId, jobPostId] ensures a student cannot submit duplicate applications to the same job posting.
* In the DailyLogs table, studentId and applicationId are foreign keys (FK) linking daily log entries and attendance hours directly to the student's active placement, with a unique constraint on [studentId, logDate] preventing multiple logs on the same date.
* In the InternshipEvaluations table, applicationId is used as a foreign key with a 1:1 unique constraint to ensure that each completed internship placement receives exactly one official mentor evaluation.
* In the Documents table, userId and applicationId are foreign keys linking candidate resumes, transcripts, and portfolios stored in Amazon S3 back to the candidate's application.
* Note that only salted and hashed passwords (using bcrypt with 10 salt rounds) are stored in the database, not plain text passwords.


## Workflow of the system

The end-to-end operational workflow of InternFlow is illustrated in the diagram below, showing the progression of stages, UI routes, and interactive user actions for both Student applicants and Company HR employers:

![Workflow of the system](file:///d:/Work2/Project/docs/workflow_of_the_system.png)

### Stage 1: Public Discovery & Role Onboarding
* **Guest Landing Page (`/`):** Visitors can explore live verified corporate internship postings, search by keyword, and apply modality (On-site / Remote) and compensation filters without authenticating.
* **Role-Based Registration (`/register`):** New users select their account role (`STUDENT` or `COMPANY_HR`), enforce a secure password policy (minimum 6 characters), and submit either academic details or corporate company information.
* **Secure Authentication (`/login`):** Users authenticate with their registered email and bcrypt-hashed password, receiving a signed 24-hour JWT token that routes them to their role-specific dashboard.

### Stage 2: Parallel Recruitment & Operational Workflows

#### Student Workflow (Applicant & Active Intern)
* **Student Step 1: Discover & Search Opportunities (`/dashboard/jobs`):** Students browse and filter positions by department, allowance, and work modality, reviewing company details and clicking "Apply Now".
* **Student Step 2: Submit Application with Resume (Apply Modal):** Students upload their CV/Resume PDF (streamed directly to Amazon S3), provide a personal statement, and include external links (GitHub/Figma). The system enforces the **One Active Application Per Company Rule** to prevent duplicate spamming, initializing the submission as `PENDING`.
* **Student Step 3: Pipeline & Interview Notice (`/dashboard/applications`):** Students monitor application progress through `PENDING` ➔ `REVIEWING` ➔ `INTERVIEW_SCHEDULED` ➔ `ACCEPTED`. When scheduled for an interview, an **Indigo Interview Notice Card** alerts the candidate that HR will reach out with the meeting schedule/link.
* **Student Step 4: Accept Offer & Commit Placement ("Accept Offer & Start"):** When an employer extends an offer, the student clicks "Accept Offer". The **Atomic Exclusivity Protocol** locks the placement to `COMMITTED` and automatically cancels/declines all other competing applications across the platform.
* **Student Step 5: Daily CWIE Logbook Journaling (`/dashboard/logbook`):** Unlocked exclusively upon holding a `COMMITTED` placement. Interns record working hours (default 8.0 hrs/day), modality (`ON_SITE`, `REMOTE`, `HYBRID`), completed deliverables, roadblocks, and solutions. Retroactive submissions are automatically flagged with an `isBackdated` warning badge.

#### Company HR Workflow (Recruiter & Mentor)
* **HR Step 1: Post & Manage Job Listings (`/dashboard/jobs/manage`):** Recruiters create new listings specifying position title, stipend (THB/month), modality, working hours, and qualifications, immediately publishing them to the live board.
* **HR Step 2: Screen Applicants in Corporate Roster (`/dashboard/applicants`):** HR views candidate profiles, academic GPAs, universities, and downloads verified S3 resumes, transitioning candidates to `REVIEWING`.
* **HR Step 3: Interview Scheduling & Offer Pipeline (Applicant Card):** HR clicks **"Schedule Interview"** (`INTERVIEW_SCHEDULED`) to indicate shortlisting while coordinating the interview date/link externally. Post-interview, HR clicks **"Extend Offer"** (`ACCEPTED`) or **"Reject"** (`REJECTED`).
* **HR Step 4: Confirmed Placement & Mentorship (Placed Intern):** Once the candidate commits, the intern is officially locked into the corporate placement. Unilateral abandonment is blocked; release requires formal student cancellation (`CANCEL_REQUESTED`) and HR confirmation (`CANCELLED`).
* **HR Step 5: Interactive Logbook Inspection Drawer (Task Inspector):** Mentors click "Inspect Logbook" to open a sliding inspection drawer, reviewing daily logs, hours, and backdated flags, awarding 1–5 star ratings (★) and qualitative feedback individually or in weekly batches.

### Stage 3: Performance Rubric Evaluation & Official Certification
* **Company Mentor: Performance Rubric (`/dashboard/evaluations`):** Upon completing the internship duration, supervisors score the intern across three standardized CWIE performance rubric categories (Work Quality, Punctuality & Attendance, and Teamwork — each 1–5 stars) along with final qualitative comments.
* **Official Output: Verified Completion Certificate (Accredited PDF):** The system verifies that approved attendance meets the required target threshold (e.g. 300.0–400.0 hours as configured by the company/curriculum) and consolidates logbook hours, mentor ratings, and rubric scores into an official printable **Internship Completion Certificate & Final Evaluation Report** for academic graduation defense.
